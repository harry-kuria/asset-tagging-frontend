import React, { useEffect, useState } from 'react'
import { Modal, Button, Alert, Badge, ProgressBar } from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import { cilReload, cilCheckCircle, cilXCircle } from '@coreui/icons'
import updateChecker from '../utils/updateChecker'

const UpdatePrompt = () => {
  const [show, setShow] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [versionInfo, setVersionInfo] = useState(null)
  const [updateInfo, setUpdateInfo] = useState(null)
  const [isChecking, setIsChecking] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [showNoUpdate, setShowNoUpdate] = useState(false)
  const [noUpdateMessage, setNoUpdateMessage] = useState('')
  const [showInstallMessage, setShowInstallMessage] = useState(false)

  useEffect(() => {
    // Start OTA update checking
    updateChecker.startPeriodicCheck()

    // Listen for OTA update events
    const handleOTAUpdate = (event) => {
      switch (event.type) {
        case 'UPDATE_AVAILABLE':
          setUpdateInfo(event)
          setShow(true)
          setShowNoUpdate(false)
          break
        case 'NO_UPDATE_AVAILABLE':
          setNoUpdateMessage(event.message)
          setShowNoUpdate(true)
          setShow(false)
          break
        case 'UPDATE_DOWNLOAD_START':
          setDownloading(true)
          setDownloadProgress(0)
          break
        case 'UPDATE_DOWNLOAD_PROGRESS':
          setDownloadProgress(event.progress)
          break
        case 'UPDATE_DOWNLOAD_COMPLETE':
          setDownloading(false)
          setDownloadProgress(100)
          break
        case 'UPDATE_READY_TO_INSTALL':
          setShowInstallMessage(true)
          break
        case 'UPDATE_DOWNLOAD_ERROR':
          setDownloading(false)
          console.error('Update download failed:', event.error)
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
      setShowNoUpdate(false)
      await updateChecker.forceCheck()
    } catch (error) {
      console.error('Manual update check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleRelaunch = () => {
    updateChecker.relaunchApp()
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

  // No Update Available Modal
  if (showNoUpdate) {
    return (
      <Modal show={showNoUpdate} onHide={() => setShowNoUpdate(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <CIcon icon={cilCheckCircle} className="me-2 text-success" />
            System Up to Date
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <CIcon icon={cilCheckCircle} size="3xl" className="text-success mb-3" />
            <h5>No Updates Available</h5>
            <p className="text-muted">
              Your system is running the latest version ({getCurrentVersion()}).
            </p>
            <p className="text-muted">
              {noUpdateMessage}
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowNoUpdate(false)}>
            Close
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={handleManualCheck}
            disabled={isChecking}
          >
            {isChecking ? 'Checking...' : 'Check Again'}
          </Button>
        </Modal.Footer>
      </Modal>
    )
  }

  // Install Message Modal
  if (showInstallMessage) {
    return (
      <Modal show={showInstallMessage} onHide={() => setShowInstallMessage(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <CIcon icon={cilCheckCircle} className="me-2 text-success" />
            Update Downloaded
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <CIcon icon={cilCheckCircle} size="3xl" className="text-success mb-3" />
            <h5>Update Ready to Install</h5>
            <p>
              The update has been downloaded successfully. Please install the downloaded file and restart the application.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInstallMessage(false)}>
            Later
          </Button>
          <Button variant="primary" onClick={handleRelaunch}>
            Restart Application
          </Button>
        </Modal.Footer>
      </Modal>
    )
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
            <h5>Downloading Update...</h5>
            <ProgressBar 
              now={downloadProgress} 
              label={`${downloadProgress}%`}
              className="mb-3"
              variant="success"
            />
            <p className="mb-0">
              Downloading update {getLatestVersion() !== 'Unknown' ? `v${getLatestVersion()}` : ''}...
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