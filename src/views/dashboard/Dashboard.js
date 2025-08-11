import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useLocation } from 'react-router-dom'
import { Container, Row, Col, Card, Form } from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import { 
  cilPeople,
  cilStorage,
  cilBarcode,
  cilFile,
} from '@coreui/icons'
import axios from 'axios'
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

import './Dashboard.scss'

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

  // Fetch system totals
  useEffect(() => {
    const fetchSystemTotals = async () => {
      try {
        const [userStats, assetStats, barcodeStats, reportStats] = await Promise.all([
          axios.get(endpoints.userStats),
          axios.get(endpoints.assetStats),
          axios.get(endpoints.barcodeStats),
          axios.get(endpoints.reportStats)
        ])

        setSystemTotals({
          users: userStats.data,
          assets: assetStats.data,
          barcodes: barcodeStats.data,
          reports: reportStats.data
        })
      } catch (error) {
        console.error('Error fetching system totals:', error)
      }
    }

    fetchSystemTotals()
  }, [])

  const hasRole = (role) => {
    return userRoles && userRoles[role] === 1
  }

  // Chart data
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [30, 40, 35, 50, 45, 35],
        borderColor: 'rgb(147, 51, 234)',
        tension: 0.4,
      },
      {
        label: 'Revenue',
        data: [25, 35, 30, 45, 40, 30],
        borderColor: 'rgb(239, 68, 68)',
        tension: 0.4,
      },
    ],
  }

  const doughnutData = {
    labels: ['Sale', 'Distribute', 'Return'],
    datasets: [{
      data: [40, 35, 25],
      backgroundColor: [
        'rgb(147, 51, 234)',
        'rgb(234, 179, 8)',
        'rgb(239, 68, 68)',
      ],
    }],
  }

  // Customer Habits Chart Data
  const habitData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Seen products',
        data: [35000, 40000, 30000, 45000, 20000, 30000, 25000],
        borderColor: '#4318FF',
        backgroundColor: '#4318FF',
        tension: 0.4,
      },
      {
        label: 'Sales',
        data: [30000, 35000, 25000, 40000, 15000, 25000, 20000],
        borderColor: '#6AD2FF',
        backgroundColor: '#6AD2FF',
        tension: 0.4,
      }
    ]
  }

  return (
    <div className="dashboard">
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h2>System Overview</h2>
          </Col>
          <Col xs="auto">
            <Form.Control type="date" />
          </Col>
        </Row>

        <Row>
          {/* Stats Cards */}
          <Col sm={6} xl={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="text-muted mb-1">Total Users</div>
                    <h3 className="mb-0">{systemTotals.users.total}</h3>
                    <small className="text-success">{systemTotals.users.active} Active</small>
                    <div className="text-muted small">Registered Users</div>
                  </div>
                  <div className="stat-icon bg-primary bg-opacity-10 text-primary p-3 rounded">
                    <CIcon icon={cilPeople} size="xl" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col sm={6} xl={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="text-muted mb-1">Total Assets</div>
                    <h3 className="mb-0">{systemTotals.assets.total}</h3>
                    <small className="text-success">{systemTotals.assets.active} Active</small>
                    <div className="text-muted small">Registered Assets</div>
                  </div>
                  <div className="stat-icon bg-info bg-opacity-10 text-info p-3 rounded">
                    <CIcon icon={cilStorage} size="xl" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col sm={6} xl={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="text-muted mb-1">Total Barcodes</div>
                    <h3 className="mb-0">{systemTotals.barcodes.total}</h3>
                    <small className="text-info">{systemTotals.barcodes.scanned} Scanned</small>
                    <div className="text-muted small">Generated Barcodes</div>
                  </div>
                  <div className="stat-icon bg-warning bg-opacity-10 text-warning p-3 rounded">
                    <CIcon icon={cilBarcode} size="xl" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col sm={6} xl={3}>
            <Card className="stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="text-muted mb-1">Total Reports</div>
                    <h3 className="mb-0">{systemTotals.reports.total}</h3>
                    <small className="text-success">{systemTotals.reports.generated} Generated</small>
                    <div className="text-muted small">System Reports</div>
                  </div>
                  <div className="stat-icon bg-success bg-opacity-10 text-success p-3 rounded">
                    <CIcon icon={cilFile} size="xl" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          {/* Charts */}
          <Col lg={8}>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="mb-0">Customer Habits</h4>
                    <small className="text-muted">Track your customer habits</small>
                  </div>
                  <Form.Select className="w-auto">
                    <option>This year</option>
                    <option>Last year</option>
                  </Form.Select>
                </div>
                <div className="chart-container">
                  <Line data={habitData} options={{ responsive: true }} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={4}>
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h4 className="mb-0">Product Statistic</h4>
                    <small className="text-muted">Track your product sales</small>
                  </div>
                  <Form.Select className="w-auto">
                    <option>Today</option>
                    <option>This Week</option>
                  </Form.Select>
                </div>
                <Doughnut data={doughnutData} options={{ responsive: true }} />
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

Dashboard.propTypes = {
  userDetails: PropTypes.object,
  userRoles: PropTypes.object,
}

export default Dashboard
