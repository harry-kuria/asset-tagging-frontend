import React from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { CRow, CCol, CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUserFollow, cilZoom, cilBarcode, cilDrop, cilCloudUpload } from '@coreui/icons'
import { Link } from 'react-router-dom'

const getUserRoles = () => {
  const storedRoles = localStorage.getItem('userRoles')
  return storedRoles ? JSON.parse(storedRoles) : {}
}
const Dashboard = () => {
  const location = useLocation()
  const userRoles = location.state ? location.state.userRoles : getUserRoles()

  const hasRole = (role) => {
    return userRoles && userRoles[role] === 1
  }

  console.log('Received userRoles:', userRoles)

  return (
    <div className="dash_">
      <CRow>
        <CCol sm="6" lg="4">
          {hasRole('userManagement') && (
            <CCard>
              <CIcon icon={cilUserFollow} height={150} className="card-img-top" />
              <CCardBody>
                <h5 className="card-title">Create Users</h5>
                <p className="card-text">Add users to the system</p>
                <Link to="/adduser" className="btn btn-primary">
                  Move to Create Users
                </Link>
              </CCardBody>
            </CCard>
          )}
        </CCol>

        <CCol sm="6" lg="4">
          {hasRole('assetManagement') && (
            <CCard>
              <CIcon icon={cilZoom} height={150} className="card-img-top" />
              <CCardBody>
                <h5 className="card-title">View Users</h5>
                <p className="card-text">Get to see the users in the system</p>
                <Link to="/users" className="btn btn-primary">
                  Move to View Users
                </Link>
              </CCardBody>
            </CCard>
          )}
        </CCol>

        {hasRole('addMultipleAssets') && (
          <CCol sm="6" lg="4">
            <CCard>
              <CIcon icon={cilCloudUpload} height={150} className="card-img-top" />
              <CCardBody>
                <h5 className="card-title">Create Assets</h5>
                <p className="card-text">Add assets to the system</p>
                <Link to="/add_asset" className="btn btn-primary">
                  Move to Create Assets
                </Link>
              </CCardBody>
            </CCard>
          </CCol>
        )}
        {hasRole('encodeAssets') && (
          <CCol sm="6" lg="4">
            <CCard>
              <CIcon icon={cilBarcode} height={150} className="card-img-top" />
              <CCardBody>
                <h5 className="card-title">Multiple Encode Assets</h5>
                <p className="card-text">Generate tags for a group of assets</p>
                <Link to="/encode_multiple" className="btn btn-primary">
                  Move to Multiple Encode
                </Link>
              </CCardBody>
            </CCard>
          </CCol>
        )}

        <CCol sm="6" lg="4">
          {hasRole('viewReports') && (
            <CCard>
              <CIcon icon={cilDrop} height={150} className="card-img-top" />
              <CCardBody>
                <h5 className="card-title">View Reports</h5>
                <p className="card-text">Generate a report about assets of your institution</p>
                <Link to="/reports" className="btn btn-primary">
                  Move to View Reports
                </Link>
              </CCardBody>
            </CCard>
          )}
        </CCol>
      </CRow>
    </div>
  )
}

Dashboard.propTypes = {
  userDetails: PropTypes.object,
  userRoles: PropTypes.object, // Add this line to define the prop type for userRoles
}

export default Dashboard
