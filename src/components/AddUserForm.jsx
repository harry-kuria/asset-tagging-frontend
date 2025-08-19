// AddUserForm.jsx

import React, { useState } from 'react'
import { 
  Container, 
  Form, 
  Button, 
  Card, 
  CardBody, 
  CardHeader, 
  Row, 
  Col, 
  Alert,
  Badge
} from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import { 
  cilUser, 
  cilLockLocked, 
  cilShieldAlt, 
  cilUserCheck, 
  cilPlus, 
  cilEnvelopeClosed,
  cilSettings,
  cilChart,
  cilPrint,
  cilBarcode,
  cilPeople,
  cilEye
} from '@coreui/icons'
import axios from 'axios'
import { endpoints } from '../config/api'
import { showApiError, showApiSuccess } from '../utils/toast'

const AddUserForm = () => {
  const [hasAllRoles, setHasAllRoles] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [user, setUser] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roles: {
      userManagement: false,
      assetManagement: false,
      encodeAssets: false,
      addMultipleAssets: false,
      viewReports: false,
      printReports: false,
    },
  })

  const roleConfig = {
    userManagement: {
      icon: cilPeople,
      title: 'User Management',
      description: 'Create, edit, and manage users',
      color: 'danger'
    },
    assetManagement: {
      icon: cilSettings,
      title: 'Asset Management',
      description: 'View and manage assets',
      color: 'warning'
    },
    encodeAssets: {
      icon: cilBarcode,
      title: 'Create Assets',
      description: 'Add new assets to the system',
      color: 'info'
    },
    addMultipleAssets: {
      icon: cilPlus,
      title: 'Multiple Assets',
      description: 'Add multiple assets at once',
      color: 'primary'
    },
    viewReports: {
      icon: cilChart,
      title: 'View Reports',
      description: 'Access and view system reports',
      color: 'success'
    },
    printReports: {
      icon: cilPrint,
      title: 'Print Reports',
      description: 'Generate and print reports',
      color: 'secondary'
    }
  }

  const handleCheckAllRoles = () => {
    const allRoles = Object.values(user.roles).every((role) => role === true)
    setHasAllRoles(allRoles)
  }

  const handleInputChange = (e) => {
    if (e.target.type === 'checkbox') {
      setUser({
        ...user,
        roles: {
          ...user.roles,
          [e.target.name]: e.target.checked,
        },
      })
    } else {
      setUser({ ...user, [e.target.name]: e.target.value })
    }
  }

  const handleAddUser = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validate required fields
      if (!user.username || !user.password || !user.email) {
        setError('Please fill in all required fields')
        return
      }

      // Check if at least one role is selected
      const hasRoles = Object.values(user.roles).some(role => role === true)
      if (!hasRoles) {
        setError('Please select at least one role for the user')
        return
      }

      // Extract the roles from the user state
      const { username, email, password, firstName, lastName, roles } = user
      const rolesArray = Object.entries(roles)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)

      // Determine the main role based on selected permissions
      let mainRole = 'user'
      if (roles.userManagement) {
        mainRole = 'admin'
      } else if (roles.assetManagement || roles.viewReports) {
        mainRole = 'manager'
      }

      // Send user data to the server
      const response = await axios.post(endpoints.addUser, {
        username,
        email,
        password,
        firstName,
        lastName,
        role: mainRole,
        roles: rolesArray,
      })

      if (response.data?.success) {
        showApiSuccess('User added successfully!')
        // Reset form
        setUser({
          username: '',
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          roles: {
            userManagement: false,
            assetManagement: false,
            encodeAssets: false,
            addMultipleAssets: false,
            viewReports: false,
            printReports: false,
          },
        })
      } else {
        setError(response.data?.error || 'Failed to add user')
      }
    } catch (error) {
      console.error('Error adding user:', error)
      setError(error.response?.data?.error || 'Failed to add user. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedRolesCount = () => {
    return Object.values(user.roles).filter(role => role === true).length
  }

  const getMainRoleBadge = () => {
    const hasAdmin = user.roles.userManagement
    const hasManager = user.roles.assetManagement || user.roles.viewReports
    
    if (hasAdmin) {
      return <Badge bg="danger" className="px-3 py-2">👑 ADMIN</Badge>
    } else if (hasManager) {
      return <Badge bg="warning" className="px-3 py-2">👨‍💼 MANAGER</Badge>
    } else {
      return <Badge bg="info" className="px-3 py-2">👤 USER</Badge>
    }
  }

  return (
    <div className="add-user-form" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <Container>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="mb-2" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            👥 Add New User
          </h2>
          <p className="text-muted">Create a new user account with specific permissions</p>
        </div>

        {error && (
          <Alert 
            variant="danger" 
            dismissible 
            onClose={() => setError(null)}
            className="border-0 shadow-sm mb-4"
            style={{ borderRadius: '12px' }}
          >
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilUser} />
              {error}
            </div>
          </Alert>
        )}

        <Row>
          {/* User Information Card */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <CardHeader 
                className="bg-white border-0 py-3" 
                style={{ borderRadius: '16px 16px 0 0' }}
              >
                <h5 className="mb-0 fw-bold">
                  <CIcon icon={cilUser} className="me-2" />
                  User Information
                </h5>
              </CardHeader>
              <CardBody className="p-4">
                <Form>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <CIcon icon={cilUser} className="me-2" />
                          Username *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={user.username}
                          onChange={handleInputChange}
                          placeholder="Enter username"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                          <CIcon icon={cilEnvelopeClosed} className="me-2" />
                          Email *
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={user.email}
                          onChange={handleInputChange}
                          placeholder="Enter email"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">First Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="firstName"
                          value={user.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter first name"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="lastName"
                          value={user.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter last name"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilLockLocked} className="me-2" />
                      Password *
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={user.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Group>
                </Form>
              </CardBody>
            </Card>
          </Col>

          {/* Role Selection Card */}
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <CardHeader 
                className="bg-white border-0 py-3" 
                style={{ borderRadius: '16px 16px 0 0' }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0 fw-bold">
                    <CIcon icon={cilShieldAlt} className="me-2" />
                    User Roles & Permissions
                  </h5>
                  <div className="d-flex align-items-center gap-2">
                    {getMainRoleBadge()}
                    <Badge bg="secondary" className="px-2 py-1">
                      {getSelectedRolesCount()} selected
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <div className="row g-3">
                  {Object.entries(roleConfig).map(([roleKey, config]) => (
                    <Col md={6} key={roleKey}>
                      <div 
                        className={`role-card p-3 border rounded-3 cursor-pointer ${
                          user.roles[roleKey] ? 'border-primary bg-primary bg-opacity-10' : 'border-light'
                        }`}
                        style={{ 
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setUser({
                            ...user,
                            roles: {
                              ...user.roles,
                              [roleKey]: !user.roles[roleKey]
                            }
                          })
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <CIcon 
                            icon={config.icon} 
                            className={`text-${config.color}`}
                            size="lg"
                          />
                          <div>
                            <div className="fw-semibold">{config.title}</div>
                            <small className="text-muted">{config.description}</small>
                          </div>
                        </div>
                        <Form.Check
                          type="checkbox"
                          checked={user.roles[roleKey]}
                          onChange={() => {}} // Handled by onClick on parent
                          className="mt-2"
                        />
                      </div>
                    </Col>
                  ))}
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="text-center mt-4">
          <Button
            variant="primary"
            onClick={handleAddUser}
            disabled={loading}
            className="px-5 py-2"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating User...
              </>
            ) : (
              <>
                <CIcon icon={cilPlus} className="me-2" />
                Create User
              </>
            )}
          </Button>
        </div>

        <style jsx>{`
          .role-card {
            transition: all 0.2s ease;
          }
          
          .role-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .cursor-pointer {
            cursor: pointer;
          }
        `}</style>
      </Container>
    </div>
  )
}

export default AddUserForm
