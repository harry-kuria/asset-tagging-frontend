import React from 'react'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilEnvelopeOpen, cilList, cilMenu } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { logo } from 'src/assets/brand/logo'

const AppHeader = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userRoles')
    navigate('/')
  }

  const handleCheckForUpdates = () => {
    if (window.moowiUpdater) {
      window.moowiUpdater.checkForUpdates()
    }
  }

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid className="d-flex justify-content-end gap-2">
        <CButton color="secondary" variant="outline" size="sm" onClick={handleCheckForUpdates}>
          Check updates
        </CButton>
        <CButton color="danger" variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </CButton>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
