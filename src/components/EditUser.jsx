// EditUser.jsx
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'

const EditUser = ({ userId }) => {
  const [userData, setUserData] = useState({ username: '', password: '' })

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`https://profitvision.geolea.com/impact/api/users/${userId}`)
        setUserData(response.data)
      } catch (error) {
        console.error('Error fetching user details:', error)
      }
    }

    fetchUserDetails()
  }, [userId])

  const handleSave = async () => {
    try {
      await axios.put(`https://profitvision.geolea.com/impact/api/users/${userId}`, userData)
      // Show success message or redirect to user list
    } catch (error) {
      console.error('Error updating user:', error)
      // Show error message
    }
  }

  return (
    <div className="container mt-5">
      <h2>Edit User</h2>
      <div className="mb-3">
        <label className="form-label">Username:</label>
        <input
          type="text"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
          className="form-control"
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Password:</label>
        <input
          type="password"
          value={userData.password}
          onChange={(e) => setUserData({ ...userData, password: e.target.value })}
          className="form-control"
        />
      </div>
      <button className="btn btn-primary" onClick={handleSave}>
        Save
      </button>
    </div>
  )
}
EditUser.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Allow both string and number
}

export default EditUser
