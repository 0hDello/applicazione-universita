import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get token from Git Credential Manager
function getGitToken() {
  try {
    const credOutput = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = credOutput.match(/password=(.+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  } catch (e) {
    console.error('Error fetching git credentials:', e);
  }
  return process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
}

function getReleaseNotesForVersion(version) {
  try {
    if (fs.existsSync('CHANGELOG.md')) {
      const changelog = fs.readFileSync('CHANGELOG.md', 'utf-8');
      const versionHeader = `## [v${version}]`;
      const nextHeader = `## [v`;
      
      const startIndex = changelog.indexOf(versionHeader);
      if (startIndex !== -1) {
        const afterStart = changelog.substring(startIndex);
        const nextIndex = afterStart.indexOf(nextHeader, versionHeader.length);
        const section = nextIndex !== -1 ? afterStart.substring(0, nextIndex) : afterStart;
        return section.trim();
      }
    }
  } catch (e) {
    console.warn('Could not parse CHANGELOG.md:', e);
  }
  return `### Release v${version}\n\n- Miglioramenti generali e correzioni di bug.\n- Supporto Auto-Update integrato.`;
}

async function uploadAsset(uploadUrl, token, filePath, name, contentType) {
  const fileData = fs.readFileSync(filePath);
  const cleanUploadUrl = uploadUrl.replace('{?name,label}', `?name=${encodeURIComponent(name)}`);
  
  console.log(`Uploading ${name} (${(fileData.length / (1024 * 1024)).toFixed(2)} MB)...`);
  const res = await fetch(cleanUploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'Universita-App-Publisher',
      'Content-Type': contentType,
      'Content-Length': String(fileData.length),
    },
    body: fileData,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Upload failed for ${name} [${res.status}]: ${errText}`);
  }

  console.log(`✓ ${name} uploaded successfully!`);
}

async function main() {
  const token = getGitToken();
  if (!token) {
    console.error('No GitHub token found!');
    process.exit(1);
  }

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  const version = packageJson.version;
  const tag = `v${version}`;
  const owner = '0hDello';
  const repo = 'applicazione-universita';
  const releaseBody = getReleaseNotesForVersion(version);

  console.log(`\n=> Creating/fetching GitHub release ${tag} for ${owner}/${repo}...`);

  // Check if release already exists
  let release;
  const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'Universita-App-Publisher',
    },
  });

  if (getRes.ok) {
    release = await getRes.json();
    console.log(`Found existing release: ${release.html_url}`);
    
    // Update release body and title with full notes
    console.log(`Updating release description with changelog notes...`);
    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/${release.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Universita-App-Publisher',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `Versione ${version} — Aggiornamento & Fix`,
        body: releaseBody,
      }),
    });
    if (updateRes.ok) {
      release = await updateRes.json();
      console.log(`✓ Release description updated successfully!`);
    }
  } else {
    // Create new release with full notes
    const createRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Universita-App-Publisher',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tag_name: tag,
        target_commitish: 'main',
        name: `Versione ${version} — Aggiornamento & Fix`,
        body: releaseBody,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create release [${createRes.status}]: ${err}`);
    }

    release = await createRes.json();
    console.log(`Created release: ${release.html_url}`);
  }

  // Upload release assets (ensuring hyphenated filenames match latest.yml)
  const releaseDir = path.resolve('release');
  const filesToUpload = [
    {
      name: `Universita-App-Setup-${version}.exe`,
      path: path.join(releaseDir, `Universita App Setup ${version}.exe`),
      type: 'application/vnd.microsoft.portable-executable',
    },
    {
      name: 'latest.yml',
      path: path.join(releaseDir, 'latest.yml'),
      type: 'text/yaml',
    },
    {
      name: `Universita-App-Setup-${version}.exe.blockmap`,
      path: path.join(releaseDir, `Universita App Setup ${version}.exe.blockmap`),
      type: 'application/octet-stream',
    },
  ];

  for (const file of filesToUpload) {
    if (fs.existsSync(file.path)) {
      // Re-fetch assets list to ensure up-to-date IDs
      const freshReleaseRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/${release.id}`, {
        headers: {
          'Authorization': `token ${token}`,
          'User-Agent': 'Universita-App-Publisher',
        },
      });
      if (freshReleaseRes.ok) {
        const freshRelease = await freshReleaseRes.json();
        const existingAsset = freshRelease.assets?.find(a => a.name === file.name);
        if (existingAsset) {
          console.log(`Deleting existing asset ${file.name}...`);
          await fetch(existingAsset.url, {
            method: 'DELETE',
            headers: {
              'Authorization': `token ${token}`,
              'User-Agent': 'Universita-App-Publisher',
            },
          });
        }
      }
      await uploadAsset(release.upload_url, token, file.path, file.name, file.type);
    } else {
      console.warn(`File not found: ${file.path}`);
    }
  }

  console.log(`\n=> SUCCESS! Release ${tag} is fully published at: ${release.html_url}`);
}

main().catch(err => {
  console.error('\n=> Error publishing release:', err);
  process.exit(1);
});
