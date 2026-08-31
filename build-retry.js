import { execSync } from 'child_process';
import { rmSync } from 'fs';
import path from 'path';

let attempts = 0;
const maxAttempts = 10;
const delayMs = 3000;

function build() {
  try {
    console.log(`\n=> Tentativo di pacchettizzazione (electron-builder) ${attempts + 1} di ${maxAttempts}...`);
    execSync('npx electron-builder', { stdio: 'inherit' });
    console.log('=> Generazione eseguibile completata con successo!');
  } catch (error) {
    attempts++;
    if (attempts >= maxAttempts) {
      console.error('\n=> Fallito dopo 10 tentativi. Controlla che Windows Defender non stia bloccando il file.');
      process.exit(1);
    }
    console.log(`\n=> Rilevato blocco di sistema. Tento di pulire la cartella temporanea e riprovo tra 3 secondi...`);
    try {
      rmSync('C:/Users/manuel.dellicarri/Desktop/Universita-Release/win-unpacked.tmp', { recursive: true, force: true });
      rmSync('C:/Users/manuel.dellicarri/Desktop/Universita-Release/win-unpacked', { recursive: true, force: true });
    } catch (e) {
      // Ignora errori di eliminazione
    }
    setTimeout(build, delayMs);
  }
}

build();
