import React, { useState, useEffect } from 'react'
import Menu from './Menu'
import LeftSide from './LeftSide'
import RightSide from './RightSide'
import { Button, Alert, Row, Col, Modal } from 'react-bootstrap'
import './Home.css'
import { BrowserRouter as Router, Route, Routes,Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  const [newuserusername, setnewuserUsername] = useState('')
  const [newuserpassword, setnewuserPassword] = useState('')
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post('https://profitvision.geolea.com/impact/api/login', {
        username: username,
        password: password,
      }) 

      if (response.data.success) {
        console.log('Authentication successful. Response data:', response.data)

        // Check the structure of the response data
        const userRoles = response.data.roles || []
        console.log('User roles:', userRoles)

        localStorage.setItem('userRoles', JSON.stringify(userRoles))

        // Make sure userRoles is set before navigating
        if (userRoles && Object.keys(userRoles).length > 0) {
          navigate('/dashboard', { state: { userRoles: response.data.roles } })
        } else {
          alert('Invalid credentials. Please try again.')
        }
      } else {
        alert('Invalid credentials. Please try again.')
      }
    } catch (error) {
      console.error('Error during login:', error)
      console.log(username)
      console.log(password)
    }
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://profitvision.geolea.com/impact/api/create-account', {
        username: newuserusername, // Change key to 'username'
      password: newuserpassword,
      });

      if (response.data.success) {
        alert('Account created successfully! You can now log in.');
        setShowCreateAccountModal(false); // Close the modal
      } else {
        alert('Error creating account. Please try again.');
      }
    } catch (error) {
      console.error('Error during account creation:', error);
    }
  };

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const response = await axios.get('https://profitvision.geolea.com/impact/api/check-trial-status');
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

    //checkTrialStatus();
  }, [navigate]);

 return (
    <div className="home-dash">
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

      <Modal show={showCreateAccountModal} onHide={() => setShowCreateAccountModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Create Account</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <form onSubmit={handleCreateAccount}>
      <div className="input-box">
        <input
          type="text" // Corrected the input type from 'username' to 'text'
          placeholder="Username"
          required
          value={newuserusername}
          onChange={(e) => setnewuserUsername(e.target.value)} // Use the correct state updater function
        />
      </div>
      <div className="input-box">
        <input
          type="password"
          placeholder="Password"
          required
          value={newuserpassword}
          onChange={(e) => setnewuserPassword(e.target.value)} // Use the correct state updater function
        />
      </div>
      <button type="submit">Create Account</button>
    </form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowCreateAccountModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>


      {/* If trial is still active, show the login form */}
      {isTrialActive && (
        <div className="wrapper-new">
          <form onSubmit={handleSubmit}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit">Login</button>
            <br/>

            <Button variant="link" onClick={() => setShowCreateAccountModal(true)}>
              Create Account
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Home;
