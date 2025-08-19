import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  CButton,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilEnvelopeOpen, cilList, cilMenu, cilReload } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { logo } from 'src/assets/brand/logo'
import updateChecker from '../utils/updateChecker'

const AppHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const [updateStatus, setUpdateStatus] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Get initial update status
    setUpdateStatus(updateChecker.getUpdateStatus())

    // Listen for update events
    const handleUpdateEvent = (event) => {
      setUpdateStatus(updateChecker.getUpdateStatus())
    }

    updateChecker.addListener(handleUpdateEvent)

    return () => {
      updateChecker.removeListener(handleUpdateEvent)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRoles')
    navigate('/')
  }

  const handleCheckUpdate = async () => {
    try {
      setIsChecking(true)
      await updateChecker.forceCheck()
    } catch (error) {
      console.error('Manual update check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <CBadge color="secondary" className="me-2">
            v{updateStatus?.currentVersion || '4.5.1'}
          </CBadge>
          {updateStatus?.updateAvailable && (
            <CBadge color="success" className="me-2">
              Update Available: v{updateStatus?.latestVersion}
            </CBadge>
          )}
        </div>
        
        <div className="d-flex align-items-center">
          <CButton 
            color="outline" 
            variant="ghost" 
            size="sm" 
            onClick={handleCheckUpdate}
            disabled={isChecking}
            className="me-2"
          >
            <CIcon icon={cilReload} className={isChecking ? 'spinner-border spinner-border-sm' : ''} />
            {isChecking ? 'Checking...' : 'Check Updates'}
          </CButton>
          
          <CButton color="danger" variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </CButton>
        </div>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
