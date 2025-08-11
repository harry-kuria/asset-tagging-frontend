const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('moowiUpdater', {
  onUpdateAvailable: (cb) => ipcRenderer.on('update-available', (_e, info) => cb(info)),
  onUpdateDownloaded: (cb) => ipcRenderer.on('update-downloaded', (_e, info) => cb(info)),
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  quitAndInstall: () => ipcRenderer.send('quit-and-install'),
}) 