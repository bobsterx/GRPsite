const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('splash', {
  version: process.env.npm_package_version || '1.0.0'
});
