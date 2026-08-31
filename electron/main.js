import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
let mainWindow = null;

// Configurazione autoUpdater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

function sendStatusToWindow(channel, data) {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(channel, data);
  }
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('updater-status', {
    status: 'checking',
    message: 'Controllo aggiornamenti in corso...',
  });
});

autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('updater-status', {
    status: 'available',
    message: `Nuova versione ${info.version} disponibile! Download in corso...`,
    version: info.version,
  });
});

autoUpdater.on('update-not-available', () => {
  sendStatusToWindow('updater-status', {
    status: 'not-available',
    message: "L'applicazione è aggiornata all'ultima versione.",
  });
});

autoUpdater.on('error', (err) => {
  const errMsg = err?.message || '';
  if (errMsg.includes('No published versions') || errMsg.includes('404')) {
    sendStatusToWindow('updater-status', {
      status: 'not-available',
      message: "L'applicazione è all'ultima versione disponibile.",
    });
  } else {
    sendStatusToWindow('updater-status', {
      status: 'error',
      message: `Errore durante il controllo aggiornamenti: ${err.message}`,
    });
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  sendStatusToWindow('updater-status', {
    status: 'downloading',
    percent: Math.round(progressObj.percent),
    bytesPerSecond: progressObj.bytesPerSecond,
    message: `Scaricamento aggiornamento: ${Math.round(progressObj.percent)}%`,
  });
});

autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('updater-status', {
    status: 'downloaded',
    version: info.version,
    message: `Versione ${info.version} scaricata! Riavvia per applicare l'aggiornamento.`,
  });
});

// Gestione chiamate IPC dal frontend React
ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return {
      status: 'dev',
      message: 'Gli aggiornamenti automatici sono disattivati in ambiente di sviluppo locale.',
    };
  }
  try {
    return await autoUpdater.checkForUpdates();
  } catch (err) {
    return { status: 'error', message: err.message };
  }
});

ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true);
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    autoHideMenuBar: true,
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Controlla aggiornamenti all'avvio solo in produzione
  mainWindow.webContents.once('did-finish-load', () => {
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates().catch(() => {});
      }, 3000);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

