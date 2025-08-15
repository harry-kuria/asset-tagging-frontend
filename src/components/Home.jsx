import React, { useState, useEffect } from 'react'
import Menu from './Menu'
import LeftSide from './LeftSide'
import RightSide from './RightSide'
import { Button, Alert, Row, Col, Modal } from 'react-bootstrap'
import './Home.css'
import { BrowserRouter as Router, Route, Routes,Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { endpoints } from '../config/api'
import { showApiError, showApiSuccess } from '../utils/toast'

const Home = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  // Create Account form state
  const [companyName, setCompanyName] = useState('')
  const [companyEmail, setCompanyEmail] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(endpoints.login, {
        username: username,
        password: password,
      }) 

      const { success, roles = [], token, message, data } = response.data || {}
      const nested = data || {}
      const authToken = token || nested.token
      const currentUser = nested.user || response.data?.user
      const currentCompany = nested.company || response.data?.company
      const isOk = success === true || response.status === 200
      if (isOk) {
        console.log('Authentication successful. Response data:', response.data)
        localStorage.setItem('userRoles', JSON.stringify(roles || []))
        if (authToken) {
          localStorage.setItem('authToken', authToken)
        }
        if (currentUser) {
          localStorage.setItem('currentUser', JSON.stringify(currentUser))
        }
        if (currentCompany) {
          localStorage.setItem('currentCompany', JSON.stringify(currentCompany))
        }
        showApiSuccess('Login successful!')
        navigate('/dashboard', { state: { userRoles: roles || [] } })
      } else {
        showApiError(new Error(message || 'Invalid credentials. Please try again.'))
      }
    } catch (error) {
      console.error('Error during login:', error)
      console.log(username)
      console.log(password)
      showApiError(error)
    }
  }

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        company_name: companyName,
        email: companyEmail,
        admin_user: {
          username: adminUsername,
          email: adminEmail,
          password: adminPassword,
        },
      }

      const response = await axios.post(endpoints.createAccount, payload)

      if (response.data?.success) {
        showApiSuccess('Account created successfully! You can now log in.')
        setShowCreateAccountModal(false)
        // reset form
        setCompanyName('')
        setCompanyEmail('')
        setAdminUsername('')
        setAdminEmail('')
        setAdminPassword('')
      } else {
        showApiError(new Error(response.data?.message || 'Error creating account. Please try again.'))
      }
    } catch (error) {
      console.error('Error during account creation:', error);
      showApiError(error)
    }
  };

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
          type="text"
          placeholder="Company Name"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
      </div>
      {/* Removed Company Code field */}
      <div className="input-box">
        <input
          type="email"
          placeholder="Company Email"
          required
          value={companyEmail}
          onChange={(e) => setCompanyEmail(e.target.value)}
        />
      </div>
      <hr />
      <div className="input-box">
        <input
          type="text"
          placeholder="Admin Username"
          required
          value={adminUsername}
          onChange={(e) => setAdminUsername(e.target.value)}
        />
      </div>
      <div className="input-box">
        <input
          type="email"
          placeholder="Admin Email"
          required
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
        />
      </div>
      <div className="input-box">
        <input
          type="password"
          placeholder="Admin Password"
          required
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
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
