import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilUserFollow,
  cilZoom,
  cilCloudUpload,
  cilBarcode,
  cilDrop,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getUserRoles = () => {
  const storedRoles = localStorage.getItem('userRoles')
  return storedRoles ? JSON.parse(storedRoles) : {}
}

const hasRole = (role) => {
  const userRoles = getUserRoles()
  return userRoles && userRoles[role] === 1
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
    hidden: !hasRole('userManagement'), // Hide if user does not have 'userManagement' role
  },
  {
    component: CNavItem,
    name: 'View Users',
    to: '/users',
    icon: <CIcon icon={cilZoom} customClassName="nav-icon" />,
    hidden: !hasRole('assetManagement'), // Hide if user does not have 'assetManagement' role
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
    hidden: !hasRole('addMultipleAssets'), // Hide if user does not have 'addMultipleAssets' role
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
    hidden: !hasRole('encodeAssets'), // Hide if user does not have 'encodeAssets' role
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
    hidden: !hasRole('viewReports'), // Hide if user does not have 'viewReports' role
  },
]

export default _nav
