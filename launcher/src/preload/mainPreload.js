const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('gravenhold', {
  loadConfig: () => ipcRenderer.invoke('config:load'),
  saveConfig: (payload) => ipcRenderer.invoke('config:save', payload),
  getLocalization: () => ipcRenderer.invoke('localization:get'),
  listComponents: () => ipcRenderer.invoke('updater:list-components'),
  installComponent: (id) => ipcRenderer.invoke('updater:install', id),
  checkRequired: () => ipcRenderer.invoke('updater:check-required'),
  launchGame: () => ipcRenderer.invoke('updater:launch'),
  fetchUpdates: () => ipcRenderer.invoke('updates:fetch'),
  submitSupport: (payload) => ipcRenderer.invoke('support:submit', payload),
  selectJava: () => ipcRenderer.invoke('dialog:select-java'),
  toggleTheme: (theme) => ipcRenderer.invoke('theme:toggle', theme),
  close: () => ipcRenderer.send('window:close'),
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  onEnvironment: (callback) => ipcRenderer.on('environment', (_event, data) => callback(data)),
  onUpdaterEvent: (callback) => ipcRenderer.on('updater:event', (_event, payload) => callback(payload)),
  restartForUpdate: () => ipcRenderer.invoke('updater:restart'),
  openExternal: (url) => ipcRenderer.invoke('open:external', url)
});
