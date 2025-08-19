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
    this.listeners = []
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
      
      // Compare versions
      if (this.isNewerVersion(this.latestVersion, CURRENT_VERSION)) {
        this.updateAvailable = true
        console.log(`🆕 Update available: ${CURRENT_VERSION} → ${this.latestVersion}`)
        this.notifyListeners({
          type: 'UPDATE_AVAILABLE',
          currentVersion: CURRENT_VERSION,
          latestVersion: this.latestVersion,
          updateUrl: this.updateUrl,
          releaseNotes: latestRelease.body
        })
      } else {
        this.updateAvailable = false
        console.log('✅ System is up to date')
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
      updateUrl: this.updateUrl
    }
  }

  // Force manual update check
  async forceCheck() {
    await this.checkForUpdates()
  }

  // Download and install update (for Electron apps)
  async downloadUpdate() {
    if (!this.updateAvailable || !this.updateUrl) {
      throw new Error('No update available')
    }

    try {
      console.log('📥 Downloading update...')
      this.notifyListeners({
        type: 'UPDATE_DOWNLOAD_START',
        updateUrl: this.updateUrl
      })

      // For web apps, redirect to the update URL
      // For Electron apps, this would trigger the auto-updater
      window.open(this.updateUrl, '_blank')
      
      this.notifyListeners({
        type: 'UPDATE_DOWNLOAD_COMPLETE',
        updateUrl: this.updateUrl
      })

    } catch (error) {
      console.error('❌ Error downloading update:', error)
      this.notifyListeners({
        type: 'UPDATE_DOWNLOAD_ERROR',
        error: error.message
      })
      throw error
    }
  }
}

// Create singleton instance
const updateChecker = new UpdateChecker()

export default updateChecker 