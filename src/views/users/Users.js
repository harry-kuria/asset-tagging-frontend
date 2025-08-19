import React, { useState, useEffect } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Row,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  InputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { 
  cilPencil, 
  cilTrash, 
  cilPlus, 
  cilUser, 
  cilUserFollow, 
  cilSearch,
  cilFilter,
  cilRefresh,
  cilShieldAlt,
  cilUserCheck,
  cilUserX,
  cilEnvelopeClosed,
  cilCalendar,
  cilLockLocked
} from '@coreui/icons'
import axios from 'axios'
import { endpoints } from '../../../config/api'

// Create axios instance with auth headers
const axiosInstance = axios.create({
  timeout: 30000,
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('authToken')
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRoles')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentCompany')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    managers: 0,
    users: 0,
    active: 0,
    inactive: 0
  })

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Calculate stats when users change
  useEffect(() => {
    const newStats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      managers: users.filter(u => u.role === 'manager').length,
      users: users.filter(u => u.role === 'user').length,
      active: users.filter(u => u.is_active).length,
      inactive: users.filter(u => !u.is_active).length
    }
    setStats(newStats)
  }, [users])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axiosInstance.get(endpoints.users)
      if (response.data.success) {
        setUsers(response.data.data)
      } else {
        setError('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.')
      } else {
        setError('Failed to fetch users. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      
      if (editingUser) {
        // Update existing user
        const updateData = { ...formData }
        if (!updateData.password) {
          delete updateData.password // Don't send empty password
        }
        
        const response = await axiosInstance.put(
          `${endpoints.users}/${editingUser.id}`,
          updateData
        )
        
        if (response.data.success) {
          setShowModal(false)
          setEditingUser(null)
          resetForm()
          fetchUsers()
        } else {
          setError(response.data.error || 'Failed to update user')
        }
      } else {
        // Create new user
        const response = await axiosInstance.post(endpoints.users, formData)
        
        if (response.data.success) {
          setShowModal(false)
          resetForm()
          fetchUsers()
        } else {
          setError(response.data.error || 'Failed to create user')
        }
      }
    } catch (error) {
      console.error('Error saving user:', error)
      if (error.response?.data?.error) {
        setError(error.response.data.error)
      } else {
        setError('Failed to save user. Please try again.')
      }
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't populate password
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      role: user.role,
    })
    setShowModal(true)
  }

  const handleDelete = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      const response = await axiosInstance.delete(`${endpoints.users}/${userToDelete.id}`)
      
      if (response.data.success) {
        setShowDeleteModal(false)
        setUserToDelete(null)
        fetchUsers()
      } else {
        setError(response.data.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setError('Failed to delete user. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'user',
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'danger', icon: cilShieldAlt, text: 'ADMIN' },
      manager: { color: 'warning', icon: cilUserCheck, text: 'MANAGER' },
      user: { color: 'info', icon: cilUser, text: 'USER' }
    }
    const config = roleConfig[role] || { color: 'secondary', icon: cilUser, text: role.toUpperCase() }
    
    return (
      <Badge 
        color={config.color} 
        className="d-flex align-items-center gap-1 px-2 py-1"
        style={{ 
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <CIcon icon={config.icon} size="sm" />
        {config.text}
      </Badge>
    )
  }

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <Badge 
        color="success" 
        className="d-flex align-items-center gap-1 px-2 py-1"
        style={{ 
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}
      >
        <CIcon icon={cilUserCheck} size="sm" />
        Active
      </Badge> : 
      <Badge 
        color="secondary" 
        className="d-flex align-items-center gap-1 px-2 py-1"
        style={{ 
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}
      >
        <CIcon icon={cilUserX} size="sm" />
        Inactive
      </Badge>
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading users...</h5>
        </div>
      </div>
    )
  }

  return (
    <div className="users-management">
      {/* Header Section */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="mb-1" style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '700'
            }}>
              👥 User Management
            </h2>
            <p className="text-muted mb-0">Manage users and their roles within your organization</p>
          </div>
          <Button 
            color="primary" 
            onClick={() => {
              setEditingUser(null)
              resetForm()
              setShowModal(true)
            }}
            className="d-flex align-items-center gap-2 px-4 py-2"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            <CIcon icon={cilPlus} />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="py-3">
                <div className="text-primary mb-1">
                  <CIcon icon={cilUser} size="lg" />
                </div>
                <h4 className="mb-1 fw-bold">{stats.total}</h4>
                <small className="text-muted">Total Users</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="py-3">
                <div className="text-danger mb-1">
                  <CIcon icon={cilShieldAlt} size="lg" />
                </div>
                <h4 className="mb-1 fw-bold">{stats.admins}</h4>
                <small className="text-muted">Admins</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="py-3">
                <div className="text-warning mb-1">
                  <CIcon icon={cilUserCheck} size="lg" />
                </div>
                <h4 className="mb-1 fw-bold">{stats.managers}</h4>
                <small className="text-muted">Managers</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="py-3">
                <div className="text-info mb-1">
                  <CIcon icon={cilUser} size="lg" />
                </div>
                <h4 className="mb-1 fw-bold">{stats.users}</h4>
                <small className="text-muted">Users</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="py-3">
                <div className="text-success mb-1">
                  <CIcon icon={cilUserCheck} size="lg" />
                </div>
                <h4 className="mb-1 fw-bold">{stats.active}</h4>
                <small className="text-muted">Active</small>
              </CardBody>
            </Card>
          </Col>
          <Col md={2}>
            <Card className="text-center border-0 shadow-sm" style={{ borderRadius: '16px' }}>
              <CardBody className="py-3">
                <div className="text-secondary mb-1">
                  <CIcon icon={cilUserX} size="lg" />
                </div>
                <h4 className="mb-1 fw-bold">{stats.inactive}</h4>
                <small className="text-muted">Inactive</small>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Search and Filter */}
        <Row className="mb-4">
          <Col md={6}>
            <InputGroup>
              <InputGroupText style={{ background: '#f8f9fa', border: '1px solid #dee2e6' }}>
                <CIcon icon={cilSearch} />
              </InputGroupText>
              <Form.Control
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ border: '1px solid #dee2e6' }}
              />
            </InputGroup>
          </Col>
          <Col md={3}>
            <Form.Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ border: '1px solid #dee2e6' }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Button
              color="outline-secondary"
              onClick={fetchUsers}
              className="w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <CIcon icon={cilRefresh} />
              Refresh
            </Button>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert 
          color="danger" 
          dismissible 
          onClose={() => setError(null)}
          className="border-0 shadow-sm"
          style={{ borderRadius: '12px' }}
        >
          <div className="d-flex align-items-center gap-2">
            <CIcon icon={cilUserX} />
            {error}
          </div>
        </Alert>
      )}

      {/* Users Table */}
      <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
        <CardHeader className="bg-white border-0 py-3" style={{ borderRadius: '16px 16px 0 0' }}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold">
              <CIcon icon={cilUser} className="me-2" />
              Users ({filteredUsers.length})
            </h5>
            <small className="text-muted">
              Showing {filteredUsers.length} of {users.length} users
            </small>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="table-responsive">
            <Table className="mb-0">
              <thead style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                <tr>
                  <th className="border-0 py-3 px-4 fw-bold">User</th>
                  <th className="border-0 py-3 px-4 fw-bold">Contact</th>
                  <th className="border-0 py-3 px-4 fw-bold">Role</th>
                  <th className="border-0 py-3 px-4 fw-bold">Status</th>
                  <th className="border-0 py-3 px-4 fw-bold">Last Login</th>
                  <th className="border-0 py-3 px-4 fw-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-light'}
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center">
                        <div 
                          className="me-3 d-flex align-items-center justify-content-center"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: '600'
                          }}
                        >
                          {user.first_name ? user.first_name[0].toUpperCase() : user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-semibold">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.username
                            }
                          </div>
                          <small className="text-muted">@{user.username}</small>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center gap-2">
                        <CIcon icon={cilEnvelopeClosed} className="text-muted" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(user.is_active)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="d-flex align-items-center gap-2">
                        <CIcon icon={cilCalendar} className="text-muted" />
                        <span>
                          {user.last_login 
                            ? new Date(user.last_login).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="btn-group" role="group">
                        <Button
                          size="sm"
                          color="info"
                          onClick={() => handleEdit(user)}
                          title="Edit User"
                          className="me-1"
                          style={{ borderRadius: '8px' }}
                        >
                          <CIcon icon={cilPencil} />
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => handleDelete(user)}
                          title="Delete User"
                          disabled={user.role === 'admin'}
                          style={{ borderRadius: '8px' }}
                        >
                          <CIcon icon={cilTrash} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-5">
              <CIcon icon={cilUser} size="3xl" className="text-muted mb-3" />
              <h5 className="text-muted">No users found</h5>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit User Modal */}
      <Modal
        show={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingUser(null)
          resetForm()
        }}
        size="lg"
        className="modal-dialog-centered"
      >
        <Modal.Header 
          closeButton 
          className="border-0 pb-0"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}
        >
          <Modal.Title className="fw-bold">
            <CIcon icon={editingUser ? cilPencil : cilPlus} className="me-2" />
            {editingUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4">
          <Form onSubmit={handleSubmit}>
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
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingUser}
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
                    value={formData.email}
                    onChange={handleInputChange}
                    required
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
                    value={formData.firstName}
                    onChange={handleInputChange}
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
                    value={formData.lastName}
                    onChange={handleInputChange}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <CIcon icon={cilLockLocked} className="me-2" />
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <CIcon icon={cilShieldAlt} className="me-2" />
                    Role *
                  </Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    style={{ borderRadius: '8px' }}
                  >
                    <option value="user">👤 User</option>
                    <option value="manager">👨‍💼 Manager</option>
                    <option value="admin">👑 Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 pt-3">
              <Button
                color="secondary"
                onClick={() => {
                  setShowModal(false)
                  setEditingUser(null)
                  resetForm()
                }}
                style={{ borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setUserToDelete(null)
        }}
        className="modal-dialog-centered"
      >
        <Modal.Header 
          closeButton 
          className="border-0"
          style={{ background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', color: 'white' }}
        >
          <Modal.Title className="fw-bold">
            <CIcon icon={cilTrash} className="me-2" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-4 text-center">
          <div className="mb-3">
            <CIcon icon={cilUserX} size="3xl" className="text-danger" />
          </div>
          <h5>Are you sure you want to delete this user?</h5>
          <p className="text-muted">
            User: <strong>{userToDelete?.username}</strong><br />
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            color="secondary"
            onClick={() => {
              setShowDeleteModal(false)
              setUserToDelete(null)
            }}
            style={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button 
            color="danger" 
            onClick={confirmDelete}
            style={{ borderRadius: '8px', fontWeight: '600' }}
          >
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .users-management {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
          padding: 2rem;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
        }
        
        .table th {
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 0.8rem;
        }
        
        .badge {
          transition: all 0.2s ease;
        }
        
        .badge:hover {
          transform: scale(1.05);
        }
        
        .btn {
          transition: all 0.2s ease;
        }
        
        .btn:hover {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  )
}

export default Users 