import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Badge, Alert } from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import { 
  cilPeople,
  cilStorage,
  cilBarcode,
  cilFile,
  cilChart,
  cilTrendingUp,
  cilTrendingDown,
  cilCalendar,
  cilClock,
  cilCheckCircle,
  cilWarning,
  cilInfo,
  cilUser,
  cilBuilding
} from '@coreui/icons'
import axiosInstance from '../../utils/axios'
import { endpoints } from '../../config/api'

// Import Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const getUserRoles = () => {
  const storedRoles = localStorage.getItem('userRoles')
  return storedRoles ? JSON.parse(storedRoles) : {}
}

const Dashboard = () => {
  const location = useLocation()
  const userRoles = location.state ? location.state.userRoles : getUserRoles()
  
  // State for system totals
  const [systemTotals, setSystemTotals] = useState({
    users: { total: 0, active: 0 },
    assets: { total: 0, active: 0 },
    barcodes: { total: 0, scanned: 0 },
    reports: { total: 0, generated: 0 }
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch system totals
  useEffect(() => {
    const fetchSystemTotals = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await axiosInstance.get(endpoints.dashboardStats)
        const stats = response.data.data // The backend returns data in a nested structure

        setSystemTotals({
          users: { total: stats.total_users || 0, active: stats.total_users || 0 },
          assets: { total: stats.total_assets || 0, active: stats.active_assets || 0 },
          barcodes: { total: stats.total_barcodes || 0, scanned: stats.scanned_barcodes || 0 },
          reports: { total: 0, generated: 0 }  // These aren't provided by the current backend
        })
      } catch (error) {
        console.error('Error fetching system totals:', error)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchSystemTotals()
  }, [])

  const hasRole = (role) => {
    return userRoles && userRoles[role] === 1
  }

  // Get user and company info
  const getUserInfo = () => {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null')
    const company = JSON.parse(localStorage.getItem('currentCompany') || 'null')
    const username = user?.username || user?.email || 'User'
    const companyName = company?.company_name || 'Company'
    return { username, companyName }
  }

  // Calculate growth percentages
  const calculateGrowth = (current, previous = 0) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  // Chart data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Assets',
        data: [systemTotals.assets.total, systemTotals.assets.total, systemTotals.assets.total, systemTotals.assets.total, systemTotals.assets.total, systemTotals.assets.total],
        borderColor: 'rgb(147, 51, 234)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Barcodes',
        data: [systemTotals.barcodes.total, systemTotals.barcodes.total, systemTotals.barcodes.total, systemTotals.barcodes.total, systemTotals.barcodes.total, systemTotals.barcodes.total],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  const doughnutData = {
    labels: ['Active Assets', 'Inactive Assets', 'Under Maintenance'],
    datasets: [{
      data: [systemTotals.assets.active, systemTotals.assets.total - systemTotals.assets.active, 0],
      backgroundColor: [
        'rgb(34, 197, 94)', // Green for active
        'rgb(239, 68, 68)', // Red for inactive
        'rgb(234, 179, 8)', // Yellow for maintenance
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  }

  // Barcode Statistics Chart Data
  const barcodeData = {
    labels: ['Total Barcodes', 'Scanned Barcodes', 'Unscanned Barcodes'],
    datasets: [{
      data: [
        systemTotals.barcodes.total, 
        systemTotals.barcodes.scanned, 
        systemTotals.barcodes.total - systemTotals.barcodes.scanned
      ],
      backgroundColor: [
        'rgb(59, 130, 246)', // Blue for total
        'rgb(34, 197, 94)',  // Green for scanned
        'rgb(156, 163, 175)', // Gray for unscanned
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    }],
  }

  // Customer Habits Chart Data
  const habitData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Assets Added',
        data: [35000, 40000, 30000, 45000, 20000, 30000, 25000],
        borderColor: '#4318FF',
        backgroundColor: 'rgba(67, 24, 255, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Barcodes Generated',
        data: [30000, 35000, 25000, 40000, 15000, 25000, 20000],
        borderColor: '#6AD2FF',
        backgroundColor: 'rgba(106, 210, 255, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  }

  const { username, companyName } = getUserInfo()

  if (loading) {
    return (
      <div className="dashboard" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        padding: '2rem'
      }}>
        <Container fluid>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard data...</p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="dashboard" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <Container fluid>
        {/* Header Section */}
        <div className="mb-4">
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center gap-3">
                <div className="avatar-circle" style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }}>
                  {username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="mb-1" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: '700'
                  }}>
                    Welcome back, {username}! 👋
                  </h2>
                  <p className="text-muted mb-0">
                    <CIcon icon={cilBuilding} className="me-1" />
                    {companyName} • {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </Col>
            <Col xs="auto">
              <div className="d-flex gap-2">
                <Form.Control 
                  type="date" 
                  className="border-0 shadow-sm"
                  style={{ borderRadius: '12px' }}
                />
                <Badge 
                  bg="success" 
                  className="px-3 py-2"
                  style={{ borderRadius: '12px' }}
                >
                  <CIcon icon={cilCheckCircle} className="me-1" />
                  System Online
                </Badge>
              </div>
            </Col>
          </Row>
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
              <CIcon icon={cilWarning} />
              {error}
            </div>
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col sm={6} xl={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted mb-2 d-flex align-items-center gap-1">
                      <CIcon icon={cilPeople} size="sm" />
                      Total Users
                    </div>
                    <h3 className="mb-2 fw-bold">{systemTotals.users.total}</h3>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="success" className="px-2 py-1" style={{ borderRadius: '8px' }}>
                        <CIcon icon={cilTrendingUp} size="sm" />
                        {calculateGrowth(systemTotals.users.total)}%
                      </Badge>
                      <small className="text-muted">{systemTotals.users.active} Active</small>
                    </div>
                  </div>
                  <div className="stat-icon" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CIcon icon={cilPeople} size="xl" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col sm={6} xl={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted mb-2 d-flex align-items-center gap-1">
                      <CIcon icon={cilStorage} size="sm" />
                      Total Assets
                    </div>
                    <h3 className="mb-2 fw-bold">{systemTotals.assets.total}</h3>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="info" className="px-2 py-1" style={{ borderRadius: '8px' }}>
                        <CIcon icon={cilTrendingUp} size="sm" />
                        {calculateGrowth(systemTotals.assets.total)}%
                      </Badge>
                      <small className="text-muted">{systemTotals.assets.active} Active</small>
                    </div>
                  </div>
                  <div className="stat-icon" style={{
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CIcon icon={cilStorage} size="xl" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col sm={6} xl={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted mb-2 d-flex align-items-center gap-1">
                      <CIcon icon={cilBarcode} size="sm" />
                      Total Barcodes
                    </div>
                    <h3 className="mb-2 fw-bold">{systemTotals.barcodes.total}</h3>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="warning" className="px-2 py-1" style={{ borderRadius: '8px' }}>
                        <CIcon icon={cilTrendingUp} size="sm" />
                        {calculateGrowth(systemTotals.barcodes.total)}%
                      </Badge>
                      <small className="text-muted">{systemTotals.barcodes.scanned} Scanned</small>
                    </div>
                  </div>
                  <div className="stat-icon" style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CIcon icon={cilBarcode} size="xl" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col sm={6} xl={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="text-muted mb-2 d-flex align-items-center gap-1">
                      <CIcon icon={cilFile} size="sm" />
                      Total Reports
                    </div>
                    <h3 className="mb-2 fw-bold">{systemTotals.reports.total}</h3>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="success" className="px-2 py-1" style={{ borderRadius: '8px' }}>
                        <CIcon icon={cilTrendingUp} size="sm" />
                        {calculateGrowth(systemTotals.reports.total)}%
                      </Badge>
                      <small className="text-muted">{systemTotals.reports.generated} Generated</small>
                    </div>
                  </div>
                  <div className="stat-icon" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CIcon icon={cilFile} size="xl" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charts Row */}
        <Row className="mb-4">
          <Col lg={8} className="mb-4">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-white border-0 py-3" style={{ borderRadius: '16px 16px 0 0' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold">
                      <CIcon icon={cilChart} className="me-2" />
                      System Growth Trends
                    </h5>
                    <small className="text-muted">Track your asset and barcode growth</small>
                  </div>
                  <Form.Select className="w-auto border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                    <option>This Year</option>
                    <option>Last Year</option>
                    <option>Last 6 Months</option>
                  </Form.Select>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="chart-container" style={{ height: '300px' }}>
                  <Line 
                    data={habitData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }} 
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4} className="mb-4">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-white border-0 py-3" style={{ borderRadius: '16px 16px 0 0' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold">
                      <CIcon icon={cilStorage} className="me-2" />
                      Asset Status
                    </h5>
                    <small className="text-muted">Asset distribution overview</small>
                  </div>
                  <Form.Select className="w-auto border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                    <option>All Assets</option>
                    <option>Active Only</option>
                  </Form.Select>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="chart-container" style={{ height: '300px' }}>
                  <Doughnut 
                    data={doughnutData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }} 
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Bottom Charts Row */}
        <Row>
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-white border-0 py-3" style={{ borderRadius: '16px 16px 0 0' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold">
                      <CIcon icon={cilBarcode} className="me-2" />
                      Barcode Statistics
                    </h5>
                    <small className="text-muted">Barcode usage distribution</small>
                  </div>
                  <Form.Select className="w-auto border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                    <option>This Month</option>
                    <option>Last Month</option>
                  </Form.Select>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="chart-container" style={{ height: '300px' }}>
                  <Doughnut 
                    data={barcodeData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }} 
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6} className="mb-4">
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
              <Card.Header className="bg-white border-0 py-3" style={{ borderRadius: '16px 16px 0 0' }}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0 fw-bold">
                      <CIcon icon={cilTrendingUp} className="me-2" />
                      Asset Overview
                    </h5>
                    <small className="text-muted">Asset status distribution</small>
                  </div>
                  <Form.Select className="w-auto border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                    <option>All Assets</option>
                    <option>Active Only</option>
                  </Form.Select>
                </div>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="chart-container" style={{ height: '300px' }}>
                  <Doughnut 
                    data={doughnutData} 
                    options={{ 
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                    }} 
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <style jsx>{`
          .dashboard {
            transition: all 0.3s ease;
          }
          
          .card {
            transition: all 0.3s ease;
          }
          
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
          }
          
          .stat-icon {
            transition: all 0.3s ease;
          }
          
          .stat-icon:hover {
            transform: scale(1.05);
          }
          
          .chart-container {
            position: relative;
          }
        `}</style>
      </Container>
    </div>
  )
}

Dashboard.propTypes = {
  userDetails: PropTypes.object,
  userRoles: PropTypes.object,
}

export default Dashboard
