const { app, BrowserWindow } = require('electron')
const path = require('path')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Optional preload script
      webSecurity: false, // If you need to disable it for local resources
    },
  })

  // Correctly resolve the path to index.html
  const indexPath = path.resolve(__dirname, 'index.html')
  console.log('Loading file from:', indexPath)  // Log the exact path for debugging

  mainWindow.loadFile(indexPath)  // Load index.html from correct path
  mainWindow.setMenuBarVisibility(false)
}

// Create the window when the app is ready
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit the app when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


// const { app, BrowserWindow } = require('electron')
// const path = require('path')
// const fs = require('fs-extra')
// const os = require('os')

// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     width: 800,
//     height: 600,
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.js'),
//       webSecurity: false,
//     },
//   })

//   // Get the username
//   const username = os.userInfo().username

//   // Get the path to the AppData directory
//   const appDataPath = app.getPath('appData')

//   // Create a hidden folder named 'MAST' within AppData for your app
//   const hiddenFolderName = 'MAST'
//   const appDirectory = path.join(appDataPath, hiddenFolderName, username)
//   fs.ensureDirSync(appDirectory)

//   // Source path is the MAST directory in AppData
//   const sourcePath = path.join(appDirectory, 'loader')

//   // Create a temporary directory for the destination
//   const tempDirectory = path.join(appDirectory, 'temp_loader')
//   fs.ensureDirSync(tempDirectory)

//   console.log('Source Path:', sourcePath)
//   console.log('Destination Path:', path.join(appDirectory, 'loader'))

//   try {
//     // Copy files from source to temporary directory
//     fs.copySync(sourcePath, tempDirectory)

//     // Copy files from temporary directory to destination
//     fs.copySync(tempDirectory, path.join(appDirectory, 'loader'))

//     // Remove temporary directory
//     fs.removeSync(tempDirectory)

//     console.log('Copy successful!')
//   } catch (error) {
//     console.error('Error copying files:', error)
//   }

//   // Load the HTML file from the 'MAST' folder in AppData
//   mainWindow.loadFile(path.join(appDirectory, 'loader', 'index.html'))
//   mainWindow.setMenuBarVisibility(false)

//   // Open the DevTools.
//   // mainWindow.webContents.openDevTools();
// }

// app.whenReady().then(() => {
//   createWindow()

//   app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) createWindow()
//   })
// })

// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') app.quit()
// })
