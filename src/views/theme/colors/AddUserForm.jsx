// AddUserForm.jsx

import React, { useState } from 'react'
import {
  TextField,
  Button,
  Container,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
} from '@mui/material'
import axios from 'axios'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

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
      const response = await axios.post('https://profitvision.geolea.com/impact/api/addUser', {
        username,
        password,
        roles: rolesArray,
      })

      console.log(response.data) // Handle the response as needed

      toast.success('User added successfully', {
        position: 'top-right',
        autoClose: 3000, // Close the toast after 3000 milliseconds (3 seconds)
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Add User
      </Typography>
      <form>
        <TextField
          label="Username"
          name="username"
          value={user.username}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={user.password}
          onChange={handleInputChange}
          fullWidth
          margin="normal"
        />
        <FormControl component="fieldset">
          <Typography variant="h6">Select User Roles:</Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.roles.userManagement}
                  onChange={handleInputChange}
                  name="userManagement"
                  onClick={handleCheckAllRoles}
                />
              }
              label="Create Users"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.roles.assetManagement}
                  onChange={handleInputChange}
                  name="assetManagement"
                  onClick={handleCheckAllRoles}
                />
              }
              label="View Users"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.roles.encodeAssets}
                  onChange={handleInputChange}
                  name="encodeAssets"
                  onClick={handleCheckAllRoles}
                />
              }
              label="Create Assets"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.roles.addMultipleAssets}
                  onChange={handleInputChange}
                  name="addMultipleAssets"
                  onClick={handleCheckAllRoles}
                />
              }
              label="Encode Multiple Assets"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.roles.viewReports}
                  onChange={handleInputChange}
                  name="viewReports"
                  onClick={handleCheckAllRoles}
                />
              }
              label="View Reports"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={user.roles.printReports}
                  onChange={handleInputChange}
                  name="printReports"
                  onClick={handleCheckAllRoles}
                />
              }
              label="Print Reports"
            />
          </FormGroup>
          <Button variant="contained" color="primary" onClick={handleAddUser}>
            Add User
          </Button>
        </FormControl>
        <ToastContainer position="top-right" autoClose={3000} />
      </form>
    </Container>
  )
}

export default AddUserForm
