const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const log = require('electron-log')
const { autoUpdater } = require('electron-updater')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
    },
  })

  // Load CRA build output when packaged
  const indexPath = path.join(__dirname, 'build', 'index.html')
  mainWindow.loadFile(indexPath)
  mainWindow.setMenuBarVisibility(false)

  // Auto-updater wiring
  log.transports.file.level = 'info'
  autoUpdater.logger = log

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', info)
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('update-downloaded', info)
  })

  ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates().catch((e) => log.error('checkForUpdates error', e))
  })

  ipcMain.on('quit-and-install', () => {
    autoUpdater.quitAndInstall()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Optionally check on startup
  autoUpdater.checkForUpdatesAndNotify().catch((e) => log.error('auto update error', e))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
