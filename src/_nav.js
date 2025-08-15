import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUserFollow,
  cilZoom,
  cilCloudUpload,
  cilBarcode,
  cilDrop,
  cilCloudDownload,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getUserRoles = () => {
  const storedRoles = localStorage.getItem('userRoles')
  return storedRoles ? JSON.parse(storedRoles) : {}
}

const hasRole = (role) => {
  const userRoles = getUserRoles()
  // If roles are not set yet, default to showing items
  if (!userRoles || Object.keys(userRoles).length === 0) return true
  return userRoles[role] === 1
}

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    badge: {
      color: 'info',
      text: 'NEW',
    },
  },
  {
    component: CNavTitle,
    name: 'User Section',
  },
  {
    component: CNavItem,
    name: 'Create Users',
    to: '/adduser',
    icon: <CIcon icon={cilUserFollow} customClassName="nav-icon" />,
    hidden: !hasRole('userManagement'),
  },
  {
    component: CNavItem,
    name: 'View Users',
    to: '/users',
    icon: <CIcon icon={cilZoom} customClassName="nav-icon" />,
    hidden: !hasRole('assetManagement'),
  },
  {
    component: CNavTitle,
    name: 'Assets',
  },
  {
    component: CNavItem,
    name: 'Create Assets',
    to: '/add_asset',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
    hidden: !hasRole('addMultipleAssets'),
  },
  {
    component: CNavTitle,
    name: 'Barcode Section',
  },
  {
    component: CNavItem,
    name: 'Generate Asset Barcodes',
    to: '/encode_multiple',
    icon: <CIcon icon={cilBarcode} customClassName="nav-icon" />,
    hidden: !hasRole('encodeAssets'),
  },
  {
    component: CNavTitle,
    name: 'Report Section',
  },
  {
    component: CNavItem,
    name: 'View Reports',
    to: '/reports',
    icon: <CIcon icon={cilDrop} customClassName="nav-icon" />,
    hidden: !hasRole('viewReports'),
  },
  {
    component: CNavItem,
    name: 'Check updates',
    onClick: () => window.moowiUpdater && window.moowiUpdater.checkForUpdates(),
    icon: <CIcon icon={cilCloudDownload} customClassName="nav-icon" />,
  },
]

export default _nav
