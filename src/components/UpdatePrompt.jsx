import React, { useEffect, useState } from 'react'
import { Modal, Button, Alert, Badge } from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import { cilReload } from '@coreui/icons'
import updateChecker from '../utils/updateChecker'

const UpdatePrompt = () => {
  const [show, setShow] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [versionInfo, setVersionInfo] = useState(null)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Start OTA update checking
    updateChecker.startPeriodicCheck()

    // Listen for OTA update events
    const handleOTAUpdate = (event) => {
      switch (event.type) {
        case 'UPDATE_AVAILABLE':
          setUpdateInfo(event)
          setShow(true)
          break
        case 'UPDATE_DOWNLOAD_START':
          setDownloading(true)
          break
        case 'UPDATE_DOWNLOAD_COMPLETE':
          setDownloading(false)
          break
        case 'UPDATE_CHECK_ERROR':
          console.error('OTA Update check failed:', event.error)
          break
        default:
          break
      }
    }

    updateChecker.addListener(handleOTAUpdate)

    // Handle Electron updater if available
    if (window.moowiUpdater) {
      window.moowiUpdater.onUpdateAvailable((info) => {
        setVersionInfo(info)
        setDownloading(true)
        setShow(true)
      })
      window.moowiUpdater.onUpdateDownloaded((info) => {
        setVersionInfo(info)
        setDownloading(false)
        setShow(true)
      })
      // trigger a check shortly after load
      const t = setTimeout(() => window.moowiUpdater.checkForUpdates(), 1500)
      return () => clearTimeout(t)
    }

    return () => {
      updateChecker.removeListener(handleOTAUpdate)
    }
  }, [])

  const handleInstall = () => {
    if (window.moowiUpdater) {
      window.moowiUpdater.quitAndInstall()
    } else if (updateInfo) {
      handleOTAUpdate()
    }
  }

  const handleOTAUpdate = async () => {
    try {
      setDownloading(true)
      await updateChecker.downloadUpdate()
    } catch (error) {
      console.error('Failed to download update:', error)
      setDownloading(false)
    }
  }

  const handleManualCheck = async () => {
    try {
      setIsChecking(true)
      await updateChecker.forceCheck()
    } catch (error) {
      console.error('Manual update check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const getCurrentVersion = () => {
    return updateInfo?.currentVersion || versionInfo?.version || 'Unknown'
  }

  const getLatestVersion = () => {
    return updateInfo?.latestVersion || versionInfo?.version || 'Unknown'
  }

  const getReleaseNotes = () => {
    return updateInfo?.releaseNotes || versionInfo?.releaseNotes || ''
  }

  if (!show) return null

  return (
    <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <CIcon icon={cilReload} className="me-2" />
          System Update Available
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {downloading ? (
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mb-0">
              Downloading update{getLatestVersion() !== 'Unknown' ? ` ${getLatestVersion()}` : ''}...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-3">
              <h6>Current Version</h6>
              <Badge bg="secondary" className="fs-6">
                v{getCurrentVersion()}
              </Badge>
            </div>
            
            <div className="mb-3">
              <h6>Latest Version</h6>
              <Badge bg="success" className="fs-6">
                v{getLatestVersion()}
              </Badge>
            </div>

            {getReleaseNotes() && (
              <div className="mb-3">
                <h6>What's New</h6>
                <div 
                  className="border rounded p-3 bg-light"
                  style={{ 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.9rem'
                  }}
                >
                  {getReleaseNotes()}
                </div>
              </div>
            )}

            <Alert variant="info">
              <strong>Note:</strong> Updates include bug fixes, security improvements, and new features.
              It's recommended to update to the latest version.
            </Alert>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShow(false)}>
          Later
        </Button>
        {!downloading && (
          <>
            <Button 
              variant="outline-primary" 
              onClick={handleManualCheck}
              disabled={isChecking}
            >
              {isChecking ? 'Checking...' : 'Check Again'}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleInstall}
              disabled={downloading}
            >
              {window.moowiUpdater ? 'Restart and Install' : 'Download Update'}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default UpdatePrompt 