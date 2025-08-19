import React, { useState, useEffect } from 'react'
import { Alert, Button, Modal, Badge } from 'react-bootstrap'
import { CUpdateIcon } from '@coreui/icons-react'
import updateChecker from '../utils/updateChecker'

const UpdateNotification = () => {
  const [updateInfo, setUpdateInfo] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    // Start update checking when component mounts
    updateChecker.startPeriodicCheck()

    // Add listener for update events
    const handleUpdateEvent = (event) => {
      switch (event.type) {
        case 'UPDATE_AVAILABLE':
          setUpdateInfo(event)
          break
        case 'UPDATE_DOWNLOAD_START':
          setIsDownloading(true)
          break
        case 'UPDATE_DOWNLOAD_COMPLETE':
          setIsDownloading(false)
          setShowModal(false)
          break
        case 'UPDATE_DOWNLOAD_ERROR':
          setIsDownloading(false)
          console.error('Update download failed:', event.error)
          break
        default:
          break
      }
    }

    updateChecker.addListener(handleUpdateEvent)

    // Cleanup listener on unmount
    return () => {
      updateChecker.removeListener(handleUpdateEvent)
    }
  }, [])

  const handleUpdateClick = async () => {
    try {
      setIsDownloading(true)
      await updateChecker.downloadUpdate()
    } catch (error) {
      console.error('Failed to download update:', error)
      setIsDownloading(false)
    }
  }

  const handleManualCheck = async () => {
    try {
      await updateChecker.forceCheck()
    } catch (error) {
      console.error('Manual update check failed:', error)
    }
  }

  if (!updateInfo) return null

  return (
    <>
      {/* Update Badge in Header */}
      <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
        <Alert variant="info" className="mb-0 shadow-sm">
          <div className="d-flex align-items-center">
            <CUpdateIcon className="me-2" />
            <div className="flex-grow-1">
              <strong>Update Available!</strong>
              <br />
              <small>
                Version {updateInfo.latestVersion} is now available
                <Badge bg="success" className="ms-2">
                  v{updateInfo.currentVersion} → v{updateInfo.latestVersion}
                </Badge>
              </small>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowModal(true)}
              className="ms-2"
            >
              View Details
            </Button>
          </div>
        </Alert>
      </div>

      {/* Update Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <CUpdateIcon className="me-2" />
            System Update Available
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h6>Current Version</h6>
            <Badge bg="secondary" className="fs-6">
              v{updateInfo.currentVersion}
            </Badge>
          </div>
          
          <div className="mb-3">
            <h6>Latest Version</h6>
            <Badge bg="success" className="fs-6">
              v{updateInfo.latestVersion}
            </Badge>
          </div>

          {updateInfo.releaseNotes && (
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
                {updateInfo.releaseNotes}
              </div>
            </div>
          )}

          <div className="alert alert-info">
            <strong>Note:</strong> Updates include bug fixes, security improvements, and new features.
            It's recommended to update to the latest version.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Later
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={handleManualCheck}
            disabled={updateChecker.isChecking}
          >
            {updateChecker.isChecking ? 'Checking...' : 'Check Again'}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateClick}
            disabled={isDownloading}
          >
            {isDownloading ? 'Downloading...' : 'Download Update'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default UpdateNotification 