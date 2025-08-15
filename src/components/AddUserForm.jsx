// AddUserForm.jsx

import React, { useState } from 'react'
import { Container, Form, Button } from 'react-bootstrap'
import axios from 'axios'
import { endpoints } from '../config/api'
import { showApiError, showApiSuccess } from '../utils/toast'

const AddUserForm = () => {
  const [hasAllRoles, setHasAllRoles] = useState(false)
  const [user, setUser] = useState({
    username: '',
    password: '',
    roles: {
      userManagement: false,
      assetManagement: false,
      encodeAssets: false,
      addMultipleAssets: false,
      viewReports: false,
      printReports: false,
      // Add more roles as needed
    },
  })
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
      // Extract the roles from the user state
      const { username, password, roles } = user
      const rolesArray = Object.entries(roles)
        .filter(([_, value]) => value)
        .map(([key, _]) => key)

      // Send roles as an array to the server
      const response = await axios.post(endpoints.addUser, {
        username,
        password,
        roles: rolesArray,
      })

      console.log(response.data) // Handle the response as needed

      if (response.data?.success) {
        showApiSuccess('User added successfully!')
        // Reset form
        setUser({
          username: '',
          password: '',
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
        showApiError(new Error(response.data?.message || 'Failed to add user'))
      }
    } catch (error) {
      console.error('Error adding user:', error)
      showApiError(error)
    }
  }

  return (
    <Container>
      <h4 className="mb-3">Add User</h4>
      <Form>
        <Form.Group className="mb-3" controlId="username">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={user.username}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={user.password}
            onChange={handleInputChange}
          />
        </Form.Group>

        <div className="mb-2 fw-semibold">Select User Roles:</div>
        <div className="mb-3">
          <Form.Check
            type="checkbox"
            label="Create Users"
            name="userManagement"
            checked={user.roles.userManagement}
            onChange={handleInputChange}
            onClick={handleCheckAllRoles}
          />
          <Form.Check
            type="checkbox"
            label="View Users"
            name="assetManagement"
            checked={user.roles.assetManagement}
            onChange={handleInputChange}
            onClick={handleCheckAllRoles}
          />
          <Form.Check
            type="checkbox"
            label="Create Assets"
            name="encodeAssets"
            checked={user.roles.encodeAssets}
            onChange={handleInputChange}
            onClick={handleCheckAllRoles}
          />
          <Form.Check
            type="checkbox"
            label="Encode Multiple Assets"
            name="addMultipleAssets"
            checked={user.roles.addMultipleAssets}
            onChange={handleInputChange}
            onClick={handleCheckAllRoles}
          />
          <Form.Check
            type="checkbox"
            label="View Reports"
            name="viewReports"
            checked={user.roles.viewReports}
            onChange={handleInputChange}
            onClick={handleCheckAllRoles}
          />
          <Form.Check
            type="checkbox"
            label="Print Reports"
            name="printReports"
            checked={user.roles.printReports}
            onChange={handleInputChange}
            onClick={handleCheckAllRoles}
          />
        </div>

        <Button variant="primary" onClick={handleAddUser}>
          Add User
        </Button>
      </Form>
    </Container>
  )
}

export default AddUserForm
