const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron')
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

// periodic update checks and manual shortcut
let updateIntervalId
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000 // 60 minutes

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // Optionally check on startup
  autoUpdater
    .checkForUpdatesAndNotify()
    .catch((e) => log.error('auto update error', e))

  // Periodic checks
  updateIntervalId = setInterval(() => {
    autoUpdater
      .checkForUpdatesAndNotify()
      .catch((e) => log.error('scheduled checkForUpdatesAndNotify error', e))
  }, UPDATE_CHECK_INTERVAL_MS)

  // Global shortcut to manually trigger update checks: Ctrl/Cmd+U
  const ok = globalShortcut.register('CommandOrControl+U', () => {
    autoUpdater
      .checkForUpdatesAndNotify()
      .catch((e) => log.error('manual checkForUpdatesAndNotify error', e))
  })
  if (!ok) {
    log.warn('Global shortcut registration failed for CommandOrControl+U')
  }
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  if (updateIntervalId) {
    clearInterval(updateIntervalId)
    updateIntervalId = undefined
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
