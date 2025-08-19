import React, { useState, useEffect, useRef } from 'react'
import { 
  Form, 
  Button, 
  ListGroup, 
  Container, 
  Modal, 
  Dropdown, 
  Card, 
  CardBody, 
  CardHeader,
  Alert,
  Badge,
  ProgressBar,
  Row,
  Col
} from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import { 
  cilBarcode,
  cilSearch,
  cilBuilding,
  cilUser,
  cilFile,
  cilDownload,
  cilPlus,
  cilCheck,
  cilWarning,
  cilInfo,
  cilSettings,
  cilFilter,
  cilList,
  cilTable,
  cilPrint,
  cilCloudDownload,
  cilArrowRight,
  cilRefresh
} from '@coreui/icons'
import AssetDetails from './AssetDetails'
import axios from 'axios'
import html2canvas from 'html2canvas'
import Barcode from 'react-barcode'
import ReactToPdf from 'react-to-pdf'
import jsPDF from 'jspdf' // Import jsPDF library
import 'jspdf-autotable'
import { endpoints } from '../../../config/api'

// Create axios instance with proper timeout and auth headers
const axiosInstance = axios.create({
  timeout: 30000, // 30 seconds timeout
})

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('authToken')
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, clear storage and redirect to login
      localStorage.removeItem('authToken')
      localStorage.removeItem('userRoles')
      localStorage.removeItem('currentUser')
      localStorage.removeItem('currentCompany')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

const MultipleEncode = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [assetDetails, setAssetDetails] = useState(null)
  const [barcodeType, setBarcodeType] = useState(null)
  const [barcodeData, setBarcodeData] = useState(null)
  const [showAssetModal, setShowAssetModal] = useState(false)
  const [departments, setDepartments] = useState([])
  const [functionalAreas, setFunctionalAreas] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const barcodesComponentRef = useRef()

  const handleDownloadPdf = () => {
    try {
      const pdf = new jsPDF()
      pdf.text('Generated Barcodes', 20, 20)
      // Define the table headers
      const headers = [['Name', 'Institution', 'Department', 'Location', 'Barcode Code']]
      // Extract table rows from generatedBarcodes
      const data = generatedBarcodes.map((barcode) => {
        const formattedString = barcode.formattedString
        const parts = formattedString.split('|')
        const namePart = parts.find(part => part.startsWith('Name:'))?.split(':')[1] || barcode.assetDetails.assetName
        const instPart = parts.find(part => part.startsWith('Inst:'))?.split(':')[1] || barcode.assetDetails.institutionName
        const deptPart = parts.find(part => part.startsWith('Dept:'))?.split(':')[1] || barcode.assetDetails.department
        const locPart = parts.find(part => part.startsWith('Loc:'))?.split(':')[1] || barcode.assetDetails.location
        
        // Create clean barcode code without variable names
        const cleanCode = `${namePart.substring(0, 2).toUpperCase()}/${parts.find(part => part.startsWith('Type:'))?.split(':')[1]?.substring(0, 2).toUpperCase() || ''}/${instPart.substring(0, 2).toUpperCase()}/${deptPart.substring(0, 2).toUpperCase()}/${locPart.substring(0, 2).toUpperCase()}`
        
        return [
          namePart,
          instPart,
          deptPart,
          locPart,
          cleanCode,
        ]
      })
      // Add the table with autoTable
      pdf.autoTable({
        startY: 30, // Adjust the starting position as needed
        head: headers,
        body: data,
        theme: 'grid', // You can choose a different theme if needed
        headStyles: {
          fillColor: [12, 83, 245],
        },
      })
      pdf.save('generated_barcodes.pdf')
    } catch (error) {
      console.error('Error capturing barcodes to PDF:', error)
    }
  }

  const [filters, setFilters] = useState({
    institution: '',
    department: '',
    functionalArea: '',
  })
  const [institutionList, setInstitutionList] = useState([])
  const [generatedBarcodes, setGeneratedBarcodes] = useState([])
  const [generateForAllDepartments, setGenerateForAllDepartments] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(null)
  
  const handleDownloadBarcode = async (barcode) => {
    try {
      const canvas = await html2canvas(/* Ref of the barcode element */)
      const dataUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `barcode_${barcode}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error capturing barcode:', error)
    }
  }
  
  const handleGenerateBarcodes = async () => {
    // Fetch assets based on filters to generate barcodes
    setIsLoading(true)
    setError(null)
    setGenerationProgress(null)
    try {
      // Check if we have the required fields
      if (generateForAllDepartments) {
        if (!filters.institution) {
          setError('Please select an institution to generate barcodes for all departments.')
          setIsLoading(false)
          return
        }
      } else {
        // If not generating for all departments, both institution and department are required
        if (!filters.institution || !filters.department) {
          setError('Please select both institution and department to generate barcodes.')
          setIsLoading(false)
          return
        }
      }

      let response
      if (generateForAllDepartments) {
        // Generate barcodes for all departments in the institution
        setGenerationProgress('Generating barcodes for all departments... This may take a moment for large datasets.')
        response = await axiosInstance.post(
          endpoints.generateBarcodesByInstitution,
          {
            institution: filters.institution,
          },
        )
      } else {
        // Generate barcodes for specific institution and department
        setGenerationProgress('Generating barcodes... This may take a moment for large datasets.')
        response = await axiosInstance.post(
          endpoints.generateBarcodesByInstitutionAndDepartment,
          {
            institution: filters.institution,
            department: filters.department,
          },
        )
      }

      const { barcodeTags, assetDetails, assetCount, totalPages, barcodesPerPage, institutionCount, institutions } = response.data.data
      // Now you can use barcodeTags and assetDetails as needed
      console.log('Barcode Tags:', barcodeTags)
      console.log('Asset Details:', assetDetails)
      console.log('Asset Count:', assetCount)
      console.log('Total Pages:', totalPages)
      console.log('Barcodes Per Page:', barcodesPerPage)
      console.log('Institution Count:', institutionCount)
      console.log('Institutions:', institutions)
      
      setGeneratedBarcodes(barcodeTags)
      setAssetDetails(assetDetails) // Assuming you have a state variable to store asset details
      
      // Show success message with details
      if (generateForAllDepartments) {
        setGenerationProgress(`✅ Successfully generated ${assetCount} barcodes across ${totalPages} pages`)
      } else {
        setGenerationProgress(`✅ Successfully generated ${assetCount} barcodes across ${totalPages} pages`)
      }
    } catch (error) {
      console.error('Error generating barcodes:', error)
      setError('Failed to generate barcodes. Please try again.')
      setGenerationProgress(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axiosInstance.get(endpoints.institutions)
        console.log('Institutions response:', response.data)
        // Ensure we have an array of data
        let data = []
        if (response.data && response.data.success && response.data.data) {
          data = response.data.data
        } else if (Array.isArray(response.data)) {
          data = response.data
        }
        console.log('Processed institutions:', data)
        setInstitutionList(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching institutions:', error)
        setError('Failed to load institutions. Please refresh the page.')
        setInstitutionList([])
      }
    }
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get(endpoints.departments)
        console.log('Departments response:', response.data)
        // Ensure we have an array of data
        let data = []
        if (response.data && response.data.success && response.data.data) {
          data = response.data.data
        } else if (Array.isArray(response.data)) {
          data = response.data
        }
        console.log('Processed departments:', data)
        setDepartments(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching departments:', error)
        setError('Failed to load departments. Please refresh the page.')
        setDepartments([])
      }
    }
    const fetchFunctionalAreas = async () => {
      try {
        const response = await axiosInstance.get(endpoints.functionalAreas)
        console.log('Functional areas response:', response.data)
        // Ensure we have an array of data
        let data = []
        if (response.data && response.data.success && response.data.data) {
          data = response.data.data
        } else if (Array.isArray(response.data)) {
          data = response.data
        }
        console.log('Processed functional areas:', data)
        setFunctionalAreas(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching functional areas:', error)
        setError('Failed to load functional areas. Please refresh the page.')
        setFunctionalAreas([])
      }
    }
    fetchInstitutions()
    fetchDepartments()
    fetchFunctionalAreas()
  }, [])

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await axiosInstance.get(endpoints.searchAssets, {
          params: {
            term: searchTerm,
            ...filters,
          },
        })
        setSearchResults(response.data)
      } catch (error) {
        console.error('Error fetching search results:', error)
      }
    }

    if (searchTerm.trim() !== '') {
      fetchSearchResults()
    } else {
      setSearchResults([])
    }
  }, [searchTerm, filters])

  const handleEncode = async (selectedBarcodeType) => {
    setBarcodeType(selectedBarcodeType)

    if (assetDetails) {
      try {
        const response = await axiosInstance.get(endpoints.getAssetDetails(assetDetails.id))
        const detailedInfo = response.data
        const institutionName = detailedInfo.institutionName.toUpperCase()
        const institutionShort = detailedInfo.institutionName.substring(0, 2).toUpperCase()
        const departmentShort = detailedInfo.department.substring(0, 2).toUpperCase()
        const functionalAreaShort = detailedInfo.functionalArea.substring(0, 2).toUpperCase()
        const assetNameShort = detailedInfo.assetName.replace(/\s/g, '').toUpperCase()
        const id = detailedInfo.id
        const dataForBarcode = `${institutionShort}/${departmentShort}/${functionalAreaShort}/${assetNameShort}/${id}`
        setBarcodeData(dataForBarcode)
      } catch (error) {
        console.error('Error fetching asset details:', error)
      }
    }
  }

  const barcodeRef = useRef(null)

  const handleDownload = async () => {
    try {
      const canvas = await html2canvas(barcodeRef.current)
      const dataUrl = canvas.toDataURL('image/png')

      const a = document.createElement('a')
      a.href = dataUrl
      a.download = 'barcode.png'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error capturing barcode:', error)
    }
  }

  useEffect(() => {
    // Implement barcode generation logic here when barcodeType changes
  }, [barcodeType])

  const handleSelectAsset = (selectedAsset) => {
    setAssetDetails(selectedAsset)
    setSearchTerm('')
    setSearchResults([])
    setShowAssetModal(true)
  }
  const handleCloseAssetModal = () => {
    setShowAssetModal(false)
  }

  return (
    <div className="multiple-encode" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <Container fluid>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="mb-2" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            🏷️ Barcode Generation
          </h2>
          <p className="text-muted">Generate and manage barcodes for your assets</p>
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

        {/* Filters Section */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
          <CardHeader 
            className="bg-white border-0 py-3" 
            style={{ borderRadius: '16px 16px 0 0' }}
          >
            <h5 className="mb-0 fw-bold">
              <CIcon icon={cilFilter} className="me-2" />
              Filter & Search Assets
            </h5>
          </CardHeader>
          <CardBody className="p-4">
            <Row>
              {!generateForAllDepartments && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilBuilding} className="me-2" />
                      Institution
                    </Form.Label>
                    <Dropdown>
                      <Dropdown.Toggle 
                        variant="outline-primary" 
                        id="dropdown-basic"
                        className="w-100 text-start border-0 shadow-sm"
                        style={{ borderRadius: '8px' }}
                      >
                        {filters.institution ? filters.institution : 'Select Institution'}
                      </Dropdown.Toggle>

                      <Dropdown.Menu className="w-100">
                        <Dropdown.Item onClick={() => setFilters({ ...filters, institution: null })}>
                          All Institutions
                        </Dropdown.Item>
                        {Array.isArray(institutionList) && institutionList.map((institution) => (
                          <Dropdown.Item
                            key={institution}
                            onClick={() => setFilters({ ...filters, institution })}
                          >
                            {institution}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Form.Group>
                </Col>
              )}

              {!generateForAllDepartments && (
                <Col md={6} className="mb-3">
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilUser} className="me-2" />
                      Department
                    </Form.Label>
                    <Dropdown>
                      <Dropdown.Toggle 
                        variant="outline-primary" 
                        id="dropdown-basic"
                        className="w-100 text-start border-0 shadow-sm"
                        style={{ borderRadius: '8px' }}
                      >
                        {filters.department ? filters.department : 'Select Department'}
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="w-100">
                        <Dropdown.Item onClick={() => setFilters({ ...filters, department: null })}>
                          All Departments
                        </Dropdown.Item>
                        {Array.isArray(departments) && departments.map((department) => (
                          <Dropdown.Item
                            key={department}
                            onClick={() => setFilters({ ...filters, department })}
                          >
                            {department}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Form.Group>
                </Col>
              )}

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    <CIcon icon={cilSearch} className="me-2" />
                    Search Asset
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter asset name or ID to search..."
                    className="border-0 shadow-sm"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Group>
              </Col>

              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Check
                    type="checkbox"
                    label={
                      <span className="fw-semibold">
                        <CIcon icon={cilSettings} className="me-2" />
                        Generate barcodes for all departments in this institution
                      </span>
                    }
                    checked={generateForAllDepartments}
                    onChange={(e) => setGenerateForAllDepartments(e.target.checked)}
                    className="p-3 border rounded-3"
                    style={{ 
                      backgroundColor: generateForAllDepartments ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                      borderColor: generateForAllDepartments ? '#667eea' : '#dee2e6',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Search Results */}
            {Array.isArray(searchResults) && searchResults.length > 0 && (
              <div className="mt-3">
                <h6 className="fw-semibold mb-2">
                  <CIcon icon={cilList} className="me-2" />
                  Search Results ({searchResults.length})
                </h6>
                <ListGroup className="border-0 shadow-sm" style={{ borderRadius: '8px' }}>
                  {searchResults.map((result) => (
                    <ListGroup.Item
                      key={result.id}
                      action
                      onClick={() => handleSelectAsset(result)}
                      className="border-0 border-bottom"
                      style={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <CIcon icon={cilBarcode} className="me-2 text-primary" />
                        {result.assetName}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Generate Button */}
        <div className="text-center mb-4">
          <Button 
            variant="primary" 
            onClick={handleGenerateBarcodes}
            disabled={isLoading}
            className="px-5 py-3"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                Generating...
              </>
            ) : (
              <>
                <CIcon icon={cilBarcode} className="me-2" />
                {generateForAllDepartments 
                  ? `Generate Barcodes for All Departments in ${filters.institution || 'Selected Institution'}`
                  : 'Generate Barcodes'
                }
              </>
            )}
          </Button>
        </div>

        {/* Progress Alert */}
        {generationProgress && (
          <Alert 
            variant="info" 
            className="border-0 shadow-sm mb-4"
            style={{ borderRadius: '12px' }}
          >
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilInfo} />
              {generationProgress}
            </div>
          </Alert>
        )}

        {/* Generated Barcodes Section */}
        {Array.isArray(generatedBarcodes) && generatedBarcodes.length > 0 && (
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <CardHeader 
              className="bg-white border-0 py-3" 
              style={{ borderRadius: '16px 16px 0 0' }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0 fw-bold">
                    <CIcon icon={cilTable} className="me-2" />
                    Generated Barcodes
                  </h5>
                  <small className="text-muted">{generatedBarcodes.length} barcodes generated</small>
                </div>
                <div className="d-flex gap-2">
                  <Badge bg="success" className="px-3 py-2" style={{ borderRadius: '8px' }}>
                    <CIcon icon={cilCheck} className="me-1" />
                    Ready
                  </Badge>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={handleDownloadPdf}
                    style={{ borderRadius: '8px' }}
                  >
                    <CIcon icon={cilPrint} className="me-1" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 py-3 px-4">#</th>
                      <th className="border-0 py-3 px-4">Name</th>
                      <th className="border-0 py-3 px-4">Institution</th>
                      <th className="border-0 py-3 px-4">Department</th>
                      <th className="border-0 py-3 px-4">Location</th>
                      <th className="border-0 py-3 px-4">Barcode Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedBarcodes.map((barcode, index) => {
                      // Parse the formattedString to extract abbreviated values
                      const formattedString = barcode.formattedString
                      const parts = formattedString.split('|')
                      const namePart = parts.find(part => part.startsWith('Name:'))?.split(':')[1] || barcode.assetDetails.assetName
                      const instPart = parts.find(part => part.startsWith('Inst:'))?.split(':')[1] || barcode.assetDetails.institutionName
                      const deptPart = parts.find(part => part.startsWith('Dept:'))?.split(':')[1] || barcode.assetDetails.department
                      const locPart = parts.find(part => part.startsWith('Loc:'))?.split(':')[1] || barcode.assetDetails.location
                      
                      // Create clean barcode code without variable names
                      const cleanCode = `${namePart.substring(0, 2).toUpperCase()}/${parts.find(part => part.startsWith('Type:'))?.split(':')[1]?.substring(0, 2).toUpperCase() || ''}/${instPart.substring(0, 2).toUpperCase()}/${deptPart.substring(0, 2).toUpperCase()}/${locPart.substring(0, 2).toUpperCase()}`
                      
                      return (
                        <tr key={index} style={{ transition: 'all 0.2s ease' }}>
                          <td className="py-3 px-4">
                            <Badge bg="primary" style={{ borderRadius: '6px' }}>
                              {index + 1}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 fw-semibold">{namePart}</td>
                          <td className="py-3 px-4">{instPart}</td>
                          <td className="py-3 px-4">{deptPart}</td>
                          <td className="py-3 px-4">{locPart}</td>
                          <td className="py-3 px-4">
                            <code className="bg-light px-2 py-1 rounded" style={{ fontSize: '0.9rem' }}>
                              {cleanCode}
                            </code>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Asset Details Modal */}
        <Modal show={showAssetModal} onHide={handleCloseAssetModal} size="lg">
          <Modal.Header 
            closeButton
            className="bg-primary text-white"
            style={{ borderRadius: '16px 16px 0 0' }}
          >
            <Modal.Title>
              <CIcon icon={cilBarcode} className="me-2" />
              Asset Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {assetDetails && <AssetDetails details={assetDetails} />}
          </Modal.Body>
        </Modal>

        <style jsx>{`
          .multiple-encode {
            transition: all 0.3s ease;
          }
          
          .card {
            transition: all 0.3s ease;
          }
          
          .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
          }
          
          .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }
          
          .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          
          .table tbody tr:hover {
            background-color: rgba(102, 126, 234, 0.05);
          }
        `}</style>
      </Container>
    </div>
  )
}

export default MultipleEncode
