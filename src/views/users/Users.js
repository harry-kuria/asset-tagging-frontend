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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilPlus, cilUser, cilUserFollow } from '@coreui/icons'
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

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

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
    const roleColors = {
      admin: 'danger',
      manager: 'warning',
      user: 'info'
    }
    return <Badge color={roleColors[role] || 'secondary'}>{role.toUpperCase()}</Badge>
  }

  const getStatusBadge = (isActive) => {
    return isActive ? 
      <Badge color="success">Active</Badge> : 
      <Badge color="secondary">Inactive</Badge>
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>User Management</h2>
        <Button 
          color="primary" 
          onClick={() => {
            setEditingUser(null)
            resetForm()
            setShowModal(true)
          }}
        >
          <CIcon icon={cilPlus} className="me-2" />
          Add User
        </Button>
      </div>

      {error && (
        <Alert color="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <h4 className="mb-0">Users ({users.length})</h4>
        </CardHeader>
        <CardBody>
          <Table responsive striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <CIcon icon={cilUser} className="me-2" />
                      {user.first_name && user.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user.username
                      }
                    </div>
                  </td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>{getStatusBadge(user.is_active)}</td>
                  <td>
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td>
                    <div className="btn-group" role="group">
                      <Button
                        size="sm"
                        color="info"
                        onClick={() => handleEdit(user)}
                        title="Edit User"
                      >
                        <CIcon icon={cilPencil} />
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        onClick={() => handleDelete(user)}
                        title="Delete User"
                        disabled={user.role === 'admin'} // Prevent deleting admin users
                      >
                        <CIcon icon={cilTrash} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
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
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingUser ? 'Edit User' : 'Add New User'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingUser} // Username cannot be changed
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Password {editingUser ? '(leave blank to keep current)' : '*'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role *</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2">
              <Button
                color="secondary"
                onClick={() => {
                  setShowModal(false)
                  setEditingUser(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button color="primary" type="submit">
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
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete user "{userToDelete?.username}"? 
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            color="secondary"
            onClick={() => {
              setShowDeleteModal(false)
              setUserToDelete(null)
            }}
          >
            Cancel
          </Button>
          <Button color="danger" onClick={confirmDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default Users 