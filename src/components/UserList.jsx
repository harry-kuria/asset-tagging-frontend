// UserList.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { endpoints } from '../config/api'
import { showApiError, showApiSuccess } from '../utils/toast'

const UserList = () => {
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(endpoints.users)
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
        showApiError(error)
      }
    }

    fetchUsers()
  }, [])

  const handleEdit = (userId) => {
    // Navigate to the edit user page with the user ID
    navigate(`/edit-user/${userId}`)
  }

  const handleDelete = async (userId) => {
    try {
      await axios.delete(endpoints.userById(userId))
      // Refresh the user list after deletion
      const response = await axios.get(endpoints.users)
      setUsers(response.data)
      showApiSuccess('User deleted successfully!')
    } catch (error) {
      console.error('Error deleting user:', error)
      showApiError(error)
    }
  }

  return (
    <div className="container mt-5">
      <h2>User List</h2>
      <ul className="list-group">
        {users.map((user) => (
          <li
            key={user.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            {user.username}
            <div>
              <button className="btn btn-primary me-2" onClick={() => handleEdit(user.id)}>
                Edit
              </button>
              <button className="btn btn-danger" onClick={() => handleDelete(user.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
export default UserList
