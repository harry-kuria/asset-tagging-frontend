import React, { useEffect, useState } from 'react'
import { Modal, Button } from 'react-bootstrap'

const UpdatePrompt = () => {
  const [show, setShow] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [versionInfo, setVersionInfo] = useState(null)

  useEffect(() => {
    if (!window.moowiUpdater) return
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
  }, [])

  const handleInstall = () => {
    window.moowiUpdater?.quitAndInstall()
  }

  if (!show) return null

  return (
    <Modal show={show} onHide={() => setShow(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update available</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {downloading ? (
          <p>Downloading update{versionInfo?.version ? ` ${versionInfo.version}` : ''}...</p>
        ) : (
          <>
            <p>
              A new version{versionInfo?.version ? ` (${versionInfo.version})` : ''} is ready to
              install.
            </p>
            {versionInfo?.releaseNotes && (
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                <div dangerouslySetInnerHTML={{ __html: String(versionInfo.releaseNotes) }} />
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {!downloading && (
          <Button variant="primary" onClick={handleInstall}>
            Restart and install
          </Button>
        )}
        <Button variant="secondary" onClick={() => setShow(false)}>
          Later
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default UpdatePrompt 