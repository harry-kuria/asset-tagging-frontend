import React, { useState, useEffect } from 'react'
import { Modal, Button, Alert, Card, Badge, ProgressBar } from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilCreditCard, cilCheckCircle, cilXCircle } from '@coreui/icons'
import axiosInstance from '../utils/axios'

const TrialManager = () => {
  const [trialStatus, setTrialStatus] = useState(null)
  const [paymentPlans, setPaymentPlans] = useState([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTrialStatus()
    fetchPaymentPlans()
  }, [])

  const fetchTrialStatus = async () => {
    try {
      const response = await axiosInstance.get('/api/trial/status')
      setTrialStatus(response.data.data)
      
      // Show trial expired modal if trial has expired
      if (response.data.data.is_expired) {
        setShowTrialExpiredModal(true)
      }
    } catch (error) {
      console.error('Failed to fetch trial status:', error)
    }
  }

  const fetchPaymentPlans = async () => {
    try {
      const response = await axiosInstance.get('/api/trial/plans')
      setPaymentPlans(response.data.data)
    } catch (error) {
      console.error('Failed to fetch payment plans:', error)
    }
  }

  const handlePaymentInitiation = async () => {
    if (!selectedPlan) return

    setLoading(true)
    setError(null)

    try {
      const response = await axiosInstance.post('/api/trial/payment', {
        plan_id: selectedPlan.id
      })

      // In a real implementation, redirect to payment gateway
      // For now, we'll show a success message
      alert(`Payment session created for ${selectedPlan.name}. Redirecting to payment...`)
      
      // Simulate payment completion (in real app, this would be handled by webhook)
      setTimeout(() => {
        setShowPaymentModal(false)
        fetchTrialStatus() // Refresh trial status
      }, 2000)

    } catch (error) {
      setError('Failed to initiate payment. Please try again.')
      console.error('Payment initiation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTrialProgress = () => {
    if (!trialStatus || trialStatus.is_expired) return 100
    
    const totalDays = 30
    const remainingDays = trialStatus.days_remaining
    const usedDays = totalDays - remainingDays
    
    return Math.min(100, Math.max(0, (usedDays / totalDays) * 100))
  }

  const getTrialStatusColor = () => {
    if (trialStatus?.is_expired) return 'danger'
    if (trialStatus?.days_remaining <= 7) return 'warning'
    return 'success'
  }

  if (!trialStatus) return null

  return (
    <>
      {/* Trial Status Badge in Header */}
      <div className="position-fixed top-0 start-0 p-3" style={{ zIndex: 1050 }}>
        <Alert variant={getTrialStatusColor()} className="mb-0 shadow-sm">
          <div className="d-flex align-items-center">
            <CIcon icon={cilWarning} className="me-2" />
            <div>
              <strong>Trial Status:</strong>
              {trialStatus.is_expired ? (
                <span className="ms-2">Expired - Payment Required</span>
              ) : (
                <span className="ms-2">{trialStatus.days_remaining} days remaining</span>
              )}
            </div>
            {!trialStatus.is_expired && (
              <Button 
                variant="outline-primary" 
                size="sm" 
                className="ms-3"
                onClick={() => setShowPaymentModal(true)}
              >
                <CIcon icon={cilCreditCard} className="me-1" />
                Upgrade
              </Button>
            )}
          </div>
          {!trialStatus.is_expired && (
            <ProgressBar 
              now={getTrialProgress()} 
              variant={getTrialStatusColor()}
              className="mt-2"
            />
          )}
        </Alert>
      </div>

      {/* Payment Plans Modal */}
      <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <CIcon icon={cilCreditCard} className="me-2" />
            Choose Your Plan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          
          <div className="row">
            {paymentPlans.map((plan) => (
              <div key={plan.id} className="col-md-4 mb-3">
                <Card 
                  className={`h-100 ${selectedPlan?.id === plan.id ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <Card.Header className="text-center">
                    <h5 className="mb-0">{plan.name}</h5>
                    <h3 className="text-primary mb-0">${plan.price}</h3>
                    <small className="text-muted">per {plan.billing_cycle}</small>
                  </Card.Header>
                  <Card.Body>
                    <ul className="list-unstyled">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="mb-2">
                          <CIcon icon={cilCheckCircle} className="text-success me-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card.Body>
                  <Card.Footer className="text-center">
                    <Button 
                      variant={selectedPlan?.id === plan.id ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                    </Button>
                  </Card.Footer>
                </Card>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePaymentInitiation}
            disabled={!selectedPlan || loading}
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Trial Expired Modal */}
      <Modal show={showTrialExpiredModal} onHide={() => {}} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>
            <CIcon icon={cilXCircle} className="text-danger me-2" />
            Trial Period Expired
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            <h5>Your 30-day trial has expired!</h5>
            <p>
              To continue using the Asset Management System, please upgrade to a paid plan.
              Your data will be preserved and you can continue from where you left off.
            </p>
          </Alert>
          
          <div className="text-center">
            <h6>Available Plans:</h6>
            <div className="row">
              {paymentPlans.slice(0, 2).map((plan) => (
                <div key={plan.id} className="col-md-6 mb-3">
                  <Card>
                    <Card.Body className="text-center">
                      <h6>{plan.name}</h6>
                      <h4 className="text-primary">${plan.price}</h4>
                      <small className="text-muted">per {plan.billing_cycle}</small>
                      <br />
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => {
                          setSelectedPlan(plan)
                          setShowTrialExpiredModal(false)
                          setShowPaymentModal(true)
                        }}
                      >
                        Choose {plan.name}
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => window.location.href = '/'}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default TrialManager 