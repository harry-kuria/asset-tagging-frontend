// OTA Update Checker for Moowi Asset Tagging System
import axios from 'axios'

const CURRENT_VERSION = '4.5.1'
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000 // 30 minutes
const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'harry-kuria'
const REPO_NAME = 'asset-tagging-frontend'

class UpdateChecker {
  constructor() {
    this.isChecking = false
    this.lastCheck = null
    this.updateAvailable = false
    this.latestVersion = null
    this.updateUrl = null
    this.downloadUrl = null
    this.listeners = []
    this.downloadProgress = 0
    this.isDownloading = false
  }

  // Start periodic update checking
  startPeriodicCheck() {
    // Check immediately on start
    this.checkForUpdates()
    
    // Set up periodic checking
    setInterval(() => {
      this.checkForUpdates()
    }, UPDATE_CHECK_INTERVAL)
  }

  // Check for available updates
  async checkForUpdates() {
    if (this.isChecking) return
    
    this.isChecking = true
    
    try {
      console.log('🔍 Checking for updates...')
      
      // Get latest release from GitHub
      const response = await axios.get(`${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      const latestRelease = response.data
      this.latestVersion = latestRelease.tag_name.replace('v', '')
      this.updateUrl = latestRelease.html_url
      
      // Find the download URL for the appropriate platform
      this.downloadUrl = this.findDownloadUrl(latestRelease.assets)
      
      // Compare versions
      if (this.isNewerVersion(this.latestVersion, CURRENT_VERSION)) {
        this.updateAvailable = true
        console.log(`🆕 Update available: ${CURRENT_VERSION} → ${this.latestVersion}`)
        this.notifyListeners({
          type: 'UPDATE_AVAILABLE',
          currentVersion: CURRENT_VERSION,
          latestVersion: this.latestVersion,
          updateUrl: this.updateUrl,
          downloadUrl: this.downloadUrl,
          releaseNotes: latestRelease.body
        })
      } else {
        this.updateAvailable = false
        console.log('✅ System is up to date')
        this.notifyListeners({
          type: 'NO_UPDATE_AVAILABLE',
          currentVersion: CURRENT_VERSION,
          latestVersion: this.latestVersion,
          message: 'No updates available'
        })
      }
      
      this.lastCheck = new Date()
      
    } catch (error) {
      console.error('❌ Error checking for updates:', error.message)
      this.notifyListeners({
        type: 'UPDATE_CHECK_ERROR',
        error: error.message
      })
    } finally {
      this.isChecking = false
    }
  }

  // Find the appropriate download URL for the current platform
  findDownloadUrl(assets) {
    if (!assets || assets.length === 0) return null
    
    const platform = this.getPlatform()
    const asset = assets.find(asset => {
      const name = asset.name.toLowerCase()
      return name.includes(platform)
    })
    
    return asset ? asset.browser_download_url : null
  }

  // Get current platform
  getPlatform() {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('win')) return 'win'
    if (userAgent.includes('mac')) return 'mac'
    if (userAgent.includes('linux')) return 'linux'
    return 'win' // default
  }

  // Compare version strings
  isNewerVersion(newVersion, currentVersion) {
    const newParts = newVersion.split('.').map(Number)
    const currentParts = currentVersion.split('.').map(Number)
    
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
      const newPart = newParts[i] || 0
      const currentPart = currentParts[i] || 0
      
      if (newPart > currentPart) return true
      if (newPart < currentPart) return false
    }
    
    return false
  }

  // Add update listener
  addListener(callback) {
    this.listeners.push(callback)
  }

  // Remove update listener
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback)
  }

  // Notify all listeners
  notifyListeners(updateInfo) {
    this.listeners.forEach(listener => {
      try {
        listener(updateInfo)
      } catch (error) {
        console.error('Error in update listener:', error)
      }
    })
  }

  // Get update status
  getUpdateStatus() {
    return {
      currentVersion: CURRENT_VERSION,
      latestVersion: this.latestVersion,
      updateAvailable: this.updateAvailable,
      lastCheck: this.lastCheck,
      isChecking: this.isChecking,
      isDownloading: this.isDownloading,
      downloadProgress: this.downloadProgress,
      updateUrl: this.updateUrl,
      downloadUrl: this.downloadUrl
    }
  }

  // Force manual update check
  async forceCheck() {
    await this.checkForUpdates()
  }

  // Download update with progress tracking
  async downloadUpdate() {
    if (!this.updateAvailable || !this.downloadUrl) {
      throw new Error('No update available or download URL not found')
    }

    if (this.isDownloading) {
      throw new Error('Download already in progress')
    }

    try {
      this.isDownloading = true
      this.downloadProgress = 0
      
      console.log('📥 Starting update download...')
      this.notifyListeners({
        type: 'UPDATE_DOWNLOAD_START',
        downloadUrl: this.downloadUrl
      })

      // For Electron apps, use the built-in updater
      if (window.moowiUpdater) {
        window.moowiUpdater.downloadUpdate()
        return
      }

      // For web apps, download the file
      const response = await axios.get(this.downloadUrl, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            this.downloadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            this.notifyListeners({
              type: 'UPDATE_DOWNLOAD_PROGRESS',
              progress: this.downloadProgress
            })
          }
        }
      })

      // Create download link and trigger download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Moowi-Installer-${this.latestVersion}.exe`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      this.downloadProgress = 100
      this.notifyListeners({
        type: 'UPDATE_DOWNLOAD_COMPLETE',
        downloadUrl: this.downloadUrl
      })

      // Show relaunch message
      setTimeout(() => {
        this.notifyListeners({
          type: 'UPDATE_READY_TO_INSTALL',
          message: 'Update downloaded successfully. Please install the downloaded file and restart the application.'
        })
      }, 1000)

    } catch (error) {
      console.error('❌ Error downloading update:', error)
      this.notifyListeners({
        type: 'UPDATE_DOWNLOAD_ERROR',
        error: error.message
      })
      throw error
    } finally {
      this.isDownloading = false
    }
  }

  // Relaunch application (for Electron)
  relaunchApp() {
    if (window.moowiUpdater) {
      window.moowiUpdater.quitAndInstall()
    } else {
      // For web apps, reload the page
      window.location.reload()
    }
  }
}

// Create singleton instance
const updateChecker = new UpdateChecker()

export default updateChecker 