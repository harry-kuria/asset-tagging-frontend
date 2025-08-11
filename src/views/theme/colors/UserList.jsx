// UserList.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { Button, Alert, Row, Col, Modal } from 'react-bootstrap'
import { endpoints } from '../../../config/api'

const UserList = () => {
  const [users, setUsers] = useState([])
  const navigate = useNavigate()
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(endpoints.users)
        setUsers(response.data)
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    fetchUsers()
  }, [])

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const response = await axios.get(endpoints.checkTrialStatus);
        if (response.data.isActive) {
          console.log(response.data.message); // Trial is still active or license is valid
          setIsTrialActive(true);
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          // Trial has expired
          setIsTrialActive(false);
          setShowModal(true);
        }
      }
    };

    checkTrialStatus();
  }, [navigate]);

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
    } catch (error) {
      console.error('Error deleting user:', error)
      // Show error message
    }
  }

  return (
    <div className="container mt-5">
      {/* Modal to prompt for license if trial expired */}
      <Modal show={showModal} centered backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>License Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your trial period has expired. Please purchase a license to continue using the system.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => (window.location.href = 'https://moowigroup.com/contact-us/')}>
            Purchase License
          </Button>
        </Modal.Footer>
      </Modal>
      <h2>User List</h2>
      {isTrialActive && (
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
      )}
    </div>
  )
}
export default UserList
