import React from 'react'
import PropTypes from 'prop-types'
import { CWidgetStatsD, CRow, CCol } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUserFollow, cilZoom, cilBarcode, cilDrop, cilCloudUpload } from '@coreui/icons'
import { CChart } from '@coreui/react-chartjs'
import { useNavigate } from 'react-router-dom'

const roleNames = [
  'userManagement',
  'assetManagement',
  'encodeAssets',
  'addMultipleAssets',
  'viewReports',
  'printReports',
]
const WidgetsBrand = ({ withCharts, userRoles }) => {
  console.log('userRoles in widget:', userRoles)
  const navigate = useNavigate()
  const hasRole = (role) => {
    console.log('Checking role:', role)
    return userRoles && userRoles[role]
  }

  const handleClick1 = () => {
    navigate('/adduser')
    // if (userRoles.canCreateUsers) {
    //   navigate('/adduser')
    // } else {
    //   // Display a message or handle the case where the user doesn't have the required roles
    //   alert('You do not have the required roles to create users.')
    // }
  }

  const handleClick2 = () => {
    navigate('/users')
    // if (userRoles.canViewUsers) {
    //   navigate('/users')
    // } else {
    //   // Display a message or handle the case where the user doesn't have the required roles
    //   alert('You do not have the required roles to view users.')
    // }
  }

  const handleClick3 = () => {
    navigate('/add_asset')
    // if (userRoles.canAddAssets) {
    //   navigate('/add_asset')
    // } else {
    //   // Display a message or handle the case where the user doesn't have the required roles
    //   alert('You do not have the required roles to add assets.')
    // }
  }

  const handleClick4 = () => {
    navigate('/encode_multiple')
    // if (userRoles.canEncodeAssets) {
    //   navigate('/encode_multiple')
    // } else {
    //   // Display a message or handle the case where the user doesn't have the required roles
    //   alert('You do not have the required roles to encode assets.')
    // }
  }

  const handleClick5 = () => {
    // Implementation for "View Reports" button click
    navigate('/reports')
    // if (userRoles.canViewReports) {
    //   navigate('/reports')
    // } else {
    //   // Display a message or handle the case where the user doesn't have the required roles
    //   alert('You do not have the required roles to view reports.')
    // }
  }

  const chartOptions = {
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 3,
      },
    },
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  }

  return (
    <CRow>
      <CCol sm={6} lg={3}>
        {hasRole('userManagement') && (
          <CWidgetStatsD
            className="mb-4"
            icon={<CIcon icon={cilUserFollow} height={52} className="my-4 text-white" />}
            values={[
              { title: '', value: 'Create Users' },
              { title: 'Add a user to the system', value: '' },
            ]}
            style={{
              '--cui-card-cap-bg': '#00aced',
            }}
            onClick={handleClick1}
          />
        )}
      </CCol>

      <CCol sm={6} lg={3}>
        {hasRole('assetManagement') && (
          <CWidgetStatsD
            className="mb-4"
            icon={<CIcon icon={cilZoom} height={52} className="my-4 text-white" />}
            values={[
              { title: '', value: 'View Users' },
              { title: 'See all users in the system', value: '' },
            ]}
            style={{
              '--cui-card-cap-bg': '#00aced',
            }}
            onClick={() => navigate('/users')}
          />
        )}
      </CCol>

      <CCol sm={6} lg={3}>
        {hasRole('addMultipleAssets') && (
          <CWidgetStatsD
            className="mb-4"
            icon={<CIcon icon={cilCloudUpload} height={52} className="my-4 text-white" />}
            values={[
              { title: '', value: 'Add Assets' },
              { title: 'Add assets in the system', value: '' },
            ]}
            style={{
              '--cui-card-cap-bg': '#00aced',
            }}
            onClick={() => navigate('/add_asset')}
          />
        )}
      </CCol>

      <CCol sm={6} lg={3}>
        {hasRole('encodeAssets') && (
          <CWidgetStatsD
            className="mb-4"
            color="#00aced"
            icon={<CIcon icon={cilBarcode} height={52} className="my-4 text-white" />}
            values={[
              { title: '', value: 'Encode Assets' },
              { title: 'Generate Barcodes for assets', value: '' },
            ]}
            style={{
              '--cui-card-cap-bg': '#00aced',
            }}
            onClick={() => navigate('/encode_multiple')}
          />
        )}
        {hasRole('viewReports') && (
          <CWidgetStatsD
            className="mb-2"
            color="#00aced"
            icon={<CIcon icon={cilDrop} height={52} className="my-4 text-white" />}
            values={[
              { title: '', value: 'View Reports' },
              { title: 'Generate Reports for assets', value: '' },
            ]}
            style={{
              '--cui-card-cap-bg': '#00aced',
            }}
            onClick={() => navigate('/reports')}
          />
        )}
      </CCol>
    </CRow>
  )
}

WidgetsBrand.propTypes = {
  withCharts: PropTypes.bool,
  userRoles: PropTypes.object,
}

export default WidgetsBrand
