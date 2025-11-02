const path = require('path');
const { app, BrowserWindow, ipcMain, nativeTheme, dialog, shell } = require('electron');
const { autoUpdater } = require('electron-updater');
const isDev = !app.isPackaged;
const ConfigManager = require('./src/main/configManager');
const Updater = require('./src/main/updater');
const Localization = require('./src/main/localization');

let mainWindow;
let splashWindow;
let configManager;
let updater;
let localization;
let ipcRegistered = false;

const registerIpc = () => {
  if (ipcRegistered) return;
  ipcRegistered = true;

  ipcMain.handle('config:load', async () => configManager.getConfig());
  ipcMain.handle('config:save', async (_event, payload) => configManager.saveConfig(payload));
  ipcMain.handle('localization:get', async () => localization.getStrings());
  ipcMain.handle('updater:list-components', async () => updater.getComponents());
  ipcMain.handle('updater:install', async (_event, id) => updater.installComponent(id));
  ipcMain.handle('updater:check-required', async () => updater.requiredInstalled());
  ipcMain.handle('updater:launch', async () => updater.launchGame());
  ipcMain.handle('updates:fetch', async () => updater.fetchUpdates());
  ipcMain.handle('support:submit', async (_event, payload) => updater.submitSupport(payload));
  ipcMain.handle('updater:restart', async () => {
    autoUpdater.quitAndInstall();
  });
  ipcMain.handle('open:external', async (_event, url) => {
    if (!url) return;
    await shell.openExternal(url);
  });
  ipcMain.handle('dialog:select-java', async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [{ name: 'Java Executable', extensions: ['exe', 'bat', 'cmd'] }]
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('theme:toggle', async (_event, theme) => {
    configManager.setTheme(theme);
    nativeTheme.themeSource = theme;
    return theme;
  });
};

const createSplash = () => {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/splashPreload.js')
    }
  });

  splashWindow.loadFile(path.join(__dirname, 'src/renderer/splash.html'));
  splashWindow.once('ready-to-show', () => splashWindow.show());
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 780,
    minWidth: 1100,
    minHeight: 720,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 20, y: 20 },
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#081018' : '#f5f9ff',
    webPreferences: {
      preload: path.join(__dirname, 'src/preload/mainPreload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src/renderer/index.html'));

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }
      mainWindow.show();
    }, 1500);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  configManager = new ConfigManager();
  updater = new Updater(configManager);
  localization = new Localization(configManager);
  registerIpc();

  createSplash();
  createWindow();

  const config = configManager.getConfig();
  if (config.autoUpdate) {
    autoUpdater.checkForUpdatesAndNotify().catch((error) => {
      console.warn('Auto update failed', error);
    });
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

autoUpdater.on('update-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('updater:event', { type: 'available' });
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('updater:event', { type: 'ready' });
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.on('window:minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.on('window:maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
});

app.on('browser-window-created', (_event, window) => {
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('did-finish-load', () => {
    window.webContents.send('environment', { isDev });
  });
});
