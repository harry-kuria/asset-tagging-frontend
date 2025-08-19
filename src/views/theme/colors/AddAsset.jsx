import React, { useState, useEffect } from 'react'
import { 
  Form, 
  Button, 
  Col, 
  Row, 
  Modal, 
  Card, 
  CardBody, 
  CardHeader, 
  Alert,
  Badge,
  Container,
  ProgressBar
} from 'react-bootstrap'
import CIcon from '@coreui/icons-react'
import { 
  cilPlus, 
  cilFile, 
  cilCloudUpload, 
  cilCloudDownload, 
  cilSave, 
  cilX,
  cilCheck,
  cilWarning,
  cilInfo,
  cilCalendar,
  cilLocationPin,
  cilBuilding,
  cilSettings,
  cilTag,
  cilMoney,
  cilChart,
  cilUser,
  cilShieldAlt,
  cilBarcode,
  cilPencil,
  cilTrash
} from '@coreui/icons'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import * as XLSX from 'xlsx'
import { useNavigate } from 'react-router-dom'
import { endpoints } from '../../../config/api'

// Create axios instance with auth headers
const axiosInstance = axios.create({
  timeout: 10000,
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

const AddAsset = () => {
  const [assetData, setAssetData] = useState({
    assetName: '',
    assetType: '',
    serialNumber: '',
    description: '',
    purchaseDate: '',
    purchasePrice: '',
    marketValue: '',
    manufacturer: '',
    modelNumber: '',
    location: '',
    status: '',
    barcode: '',
    institutionName: '',
    department: '',
    functionalArea: '',
    logo: null,
  })

  const [assetCategories, setAssetCategories] = useState([])
  const [assetsArray, setAssetsArray] = useState([])
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    // Fetch asset categories when the component mounts
    const fetchAssetCategories = async () => {
      try {
        const response = await axiosInstance.get(endpoints.categories)
        console.log('Categories response:', response.data)
        
        // Extract categories from the nested data structure
        let data = []
        if (response.data && response.data.success && response.data.data) {
          data = response.data.data
        } else if (Array.isArray(response.data)) {
          data = response.data
        }
        
        console.log('Extracted categories:', data)
        
        // Filter out duplicates and ensure we have valid data
        const uniqueCategories = data
          .filter(category => category && category.name) // Filter out invalid entries
          .reduce((acc, category) => {
            // Check if we already have a category with this name
            const existingCategory = acc.find(cat => cat.name === category.name)
            if (!existingCategory) {
              acc.push(category)
            }
            return acc
          }, [])
        
        console.log('Unique categories:', uniqueCategories)
        setAssetCategories(uniqueCategories)
      } catch (error) {
        console.error('Error fetching asset categories:', error)
        setAssetCategories([])
      }
    }
    fetchAssetCategories()
  }, [])

  // Debug log for assetCategories state changes
  useEffect(() => {
    console.log('assetCategories state updated:', assetCategories)
    console.log('assetCategories length:', assetCategories.length)
  }, [assetCategories])

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const response = await axiosInstance.get(endpoints.checkTrialStatus);
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setAssetData({ ...assetData, [name]: value })
  }

  const handleDownloadTemplate = () => {
    const headers = [
      'TYPE',
      'NAME',
      'SERIAL NUMBER',
      'DESCRIPTION',
      'PRICE',
      'MARKET VALUE',
      'MANUFACTURER',
      'MODEL NUMBER',
      'LOCATION',
      'STATUS',
      'BARCODE',
      'INSTITUTION',
      'DEPARTMENT',
      'FUNCTIONAL AREA',
      'VEHICLE REG NO',
      'OWNERSHIP',
      'INSTITUTION NUMBER',
      'NEAREST TOWN',
      'STREET',
      'COUNTY',
      'LRNO',
      'SIZE',
      'OWNERSHIP STATUS',
      'SOURCE OF FUNDS',
      'MODE OF ACQUISITION',
      'BUILDING TYPE',
      'DESIGNATED USE',
      'NO OF FLOORS',
      'AREA',
      'VALUATION',
      'ANNUAL DEPRECIATION',
      'ESTIMATED USEFUL LIFE',
      'ACCUMULATED DEPRECIATION RATE',
      'NETBOOK VALUE',
      'ANNUAL RENTAL INCOME',
      'LAND DESCRIPTION',
      'MODE OF ACQUISITION',
      'NEAREST TOWN',
      'GPS',
      'POLYGON',
      'LR NO',
      'OWNERSHIP DOCUMENT',
      'OWNERSHIP DETAILS',
      'SIZE',
      'OWNERSHIP STATUS',
      'ACQUISITION DATE',
      'REGISTRATION DATE',
      'DISPUTED/UNDISPUTED',
      'ENCUMBERANCES',
      'PLANNED/UNPLANNED',
      'PURPOSE',
      'SURVEYED/NOT SURVEYED',
      'ACQUISITION AMOUNT',
      'FAIR VALUE',
      'DISPOSAL DATE',
      'DISPOSAL VALUE',
      'ANNUAL RENTAL INCOME OF LAND',
      'TAG',
      'UNIT VALUE',
      'UNIT PRICE',
      'CURRENT VALUE',
    ]
    const ws = XLSX.utils.aoa_to_sheet([headers])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'asset_import_template.xlsx')
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const parsedData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        // Assuming your Excel sheet has headers and follows a specific structure
        const [excelHeaders, ...rows] = parsedData
        // Handle dynamic mapping based on headers in the file
        // Assuming that each header in the file corresponds to a field in your system
        const dynamicMapping = {
          assetName: 'NAME', // Example, replace with the actual headers
          assetType: 'TYPE',
          serialNumber: 'SERIAL NUMBER',
          description: 'DESCRIPTION',
          purchasePrice: 'PRICE',
          marketValue: 'MARKET VALUE',
          manufacturer: 'MANUFACTURER',
          modelNumber: 'MODEL NUMBER',
          location: 'LOCATION',
          status: 'STATUS',
          barcode: 'BARCODE',
          institutionName: 'INSTITUTION',
          department: 'DEPARTMENT',
          functionalArea: 'FUNCTIONAL AREA',
          vehicleregno: 'VEHICLE REG NO',
          ownership: 'OWNERSHIP',
          institutionno: 'INSTITUTION NUMBER',
          nearesttown: 'NEAREST TOWN',
          street: 'STREET',
          county: 'COUNTY',
          lrno: 'LRNO',
          sizeofland: 'SIZE',
          ownershipstatus: 'OWNERSHIP STATUS',
          sourceoffunds: 'SOURCE OF FUNDS',
          modeofacquisition: 'MODE OF AQUISITION',
          buildingtype: 'BUILDING TYPE',
          designateduse: 'DESIGNATED USE',
          nooffloors: 'NO OF FLOORS',
          area: 'AREA',
          valuation: 'VALUATION',
          annualdepreciation: 'ANNUAL DEPRECIATION',
          estimatedusefullife: 'ESTIMATED USEFUL LIFE',
          accumulateddepreciationrate: 'ACCUMULATED DEPRECIATION RATE',
          netbookvalue: 'NETBOOK VALUE',
          annualrentalincome: 'ANNUAL RENTAL INCOME',
          land_description: 'LAND DESCRIPTION',
          mode_of_acquisition: 'MODE OF ACQUISITION',
          nearest_town_location: 'NEAREST TOWN',
          gps: 'GPS',
          polygon: 'POLYGON',
          lr_certificate_no: 'LR NO',
          document_of_ownership: 'OWNERSHIP DOCUMENT',
          ownership_details: 'OWNERSHIP DETAILS',
          size_ha: 'SIZE',
          ownership_status: 'OWNERSHIP STATUS',
          acquisition_date: 'ACQUISITION DATE',
          registration_date: 'REGISTRATION DATE',
          disputed_undisputed: 'DISPUTED/UNDISPUTED',
          encumbrances: 'ENCUMBERANCES',
          planned_unplanned: 'PLANNED/UNPLANNED',
          purpose_use_of_land: 'PURPOSE',
          surveyed_not_surveyed: 'SURVEYED/NOT SURVEYED',
          acquisition_amount: 'ACQUISITION AMOUNT',
          fair_value_ministry_of_lands: 'FAIR VALUE',
          disposal_date_change_of_use_date: 'DISPOSAL DATE',
          disposal_value: 'DISPOSAL VALUE',
          annual_rental_income: 'ANNUAL RENTAL INCOME OF LAND',
          tag: 'TAG',
          unitValue: 'UNIT VALUE',
          unitPrice: 'UNIT PRICE',
          currentValue: 'CURRENT VALUE',
          // Add more fields based on your requirements
        }
        const dynamicAssetsArray = rows.map((row) => {
          const assetObject = {}
          excelHeaders.forEach((header, index) => {
            if (header === 'TYPE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['assetType'] = extractAssetType(row[index])
            }
            if (header === 'NAME') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['assetName'] = extractAssetType(row[index])
            }
            if (header === 'DESCRIPTION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['description'] = extractAssetType(row[index])
            }
            if (header === 'INSTITUTION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['institutionName'] = extractAssetType(row[index])
            }
            if (header === 'SERIAL NUMBER') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['serialNumber'] = extractAssetType(row[index])
            }
            if (header === 'PRICE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['purchasePrice'] = extractAssetType(row[index])
            }
            if (header === 'MARKET VALUE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['marketValue'] = extractAssetType(row[index])
            }
            if (header === 'MODEL NUMBER') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['modelNumber'] = extractAssetType(row[index])
            }
            if (header === 'MANUFACTURER') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['manufacturer'] = extractAssetType(row[index])
            }
            if (header === 'LOCATION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['location'] = extractAssetType(row[index])
            }
            if (header === 'TAG') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['tag'] = extractAssetType(row[index])
            }
            if (header === 'UNIT VALUE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['unitValue'] = extractAssetType(row[index])
            }
            if (header === 'STATUS') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['status'] = extractAssetType(row[index])
            }
            if (header === 'UNIT PRICE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['unitPrice'] = extractAssetType(row[index])
            }
            if (header === 'CURRENT VALUE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['currentValue'] = extractAssetType(row[index])
            }
            if (header === 'DEPARTMENT') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['department'] = extractAssetType(row[index])
            }
            if (header === 'FUNCTIONAL AREA') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['functionalArea'] = extractAssetType(row[index])
            }
            if (header === 'REG. NO') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['vehicleregno'] = extractAssetType(row[index])
            }
            if (header === 'SOURCE OF FUNDS') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['sourceoffunds'] = extractAssetType(row[index])
            }
            if (header === 'ENGINE NO.') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['enginenumber'] = extractAssetType(row[index])
            }
            if (header === 'CHASSIS NO') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['chassisnumber'] = extractAssetType(row[index])
            }
            if (header === 'MAKE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['make'] = extractAssetType(row[index])
            }
            if (header === 'PURCHASE YEAR') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['purchaseyear'] = extractAssetType(row[index])
            }
            if (header === 'PV NUMBER') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['pvnumber'] = extractAssetType(row[index])
            }
            if (header === 'ORIGINAL LOCATION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['originallocation'] = extractAssetType(row[index])
            }
            if (header === 'CURRENT LOCATION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['currentlocation'] = extractAssetType(row[index])
            }
            if (header === 'REPLACEMENT DATE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['replacementdate'] = extractAssetType(row[index])
            }
            if (header === 'AMOUNT') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['amount'] = extractAssetType(row[index])
            }
            if (header === 'DEPRECIATION RATE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['depreciationrate'] = extractAssetType(row[index])
            }
            if (header === 'ANNUAL DEPRECIATION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['annualdepreciation'] = extractAssetType(row[index])
            }
            if (header === 'ACCUMULATED DEPRECIATION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['accumulateddepreciation'] = extractAssetType(row[index])
            }
            if (header === 'NETBOOK VALUE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['netbookvalue'] = extractAssetType(row[index])
            }
            if (header === 'DISPOSAL DATE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['disposaldate'] = extractAssetType(row[index])
            }
            if (header === 'RESPONSIBLE OFFICER') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['responsibleofficer'] = extractAssetType(row[index])
            }
            if (header === 'CONDITION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['assetcondition'] = extractAssetType(row[index])
            }
            if (header === 'OWNERSHIP') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['ownership'] = extractAssetType(row[index])
            }
            if (header === 'INSTITUTION NUMBER') {
              // Extract the asset type from the value in the "TYPE" column
              const institutionNumberValue = row[excelHeaders.indexOf('INSTITUTION NUMBER')]
              assetObject['institutionno'] = extractAssetType(institutionNumberValue)
            }
            if (header === 'NEAREST TOWN') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['nearesttown'] = extractAssetType(row[index])
            }
            if (header === 'STREET') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['street'] = extractAssetType(row[index])
            }
            if (header === 'COUNTY') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['county'] = extractAssetType(row[index])
            }
            if (header === 'LRNO') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['lrno'] = extractAssetType(row[index])
            }
            if (header === 'SIZE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['sizeofland'] = extractAssetType(row[index])
            }
            if (header === 'OWNERSHIP STATUS') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['ownershipstatus'] = extractAssetType(row[index])
            }
            if (header === 'SOURCE OF FUNDS') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['sourceoffunds'] = extractAssetType(row[index])
            }
            if (header === 'MODE OF AQUISITION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['modeofacquisition'] = extractAssetType(row[index])
            }
            if (header === 'BUILDING TYPE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['buildingtype'] = extractAssetType(row[index])
            }
            if (header === 'DESIGNATED USE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['designateduse'] = extractAssetType(row[index])
            }
            if (header === 'NO OF FLOORS') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['nooffloors'] = extractAssetType(row[index])
            }
            if (header === 'AREA') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['area'] = extractAssetType(row[index])
            }
            if (header === 'VALUATION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['valuation'] = extractAssetType(row[index])
            }
            if (header === 'ANNUAL DEPRECIATION') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['annualdepreciation'] = extractAssetType(row[index])
            }
            if (header === 'ESTIMATED USEFUL LIFE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['estimatedusefullife'] = extractAssetType(row[index])
            }
            if (header === 'ACCUMULATED DEPRECIATION RATE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['accumulateddepreciationrate'] = extractAssetType(row[index])
            }
            if (header === 'NETBOOK VALUE') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['netbookvalue'] = extractAssetType(row[index])
            }
            if (header === 'ANNUAL RENTAL INCOME') {
              // Extract the asset type from the value in the "TYPE" column
              assetObject['annualrentalincome'] = extractAssetType(row[index])
            } else {
              const columnName = dynamicMapping[header] || header
              assetObject[columnName] = row[index]
            }
          })
          return assetObject
        })
        // Combine both arrays or use the dynamicAssetsArray based on your logic
        const combinedAssetsArray = [...assetsArray, ...dynamicAssetsArray]
        setAssetsArray(combinedAssetsArray)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const extractAssetType = (value) => {
    // Convert the value to a string before trimming
    const trimmedValue = typeof value === 'string' ? value.trim() : String(value).trim()

    // Perform additional processing as needed
    // For example, you might want to handle specific cases or apply additional checks
    return trimmedValue
  }
  const handleAddToDatabase = async () => {
    try {
      // Group assets by type
      const assetsByType = assetsArray.reduce((acc, asset) => {
        const assetType = asset.assetType ? asset.assetType.toLowerCase().trim() : 'other'
        if (!acc[assetType]) {
          acc[assetType] = []
        }
        acc[assetType].push(asset)
        return acc
      }, {})
      // Loop through each asset type and make a request to the corresponding endpoint
      const requests = Object.entries(assetsByType).map(async ([assetType, assets]) => {
        try {
          const response = await axiosInstance.post(endpoints.addMultipleAssets(assetType), assets)
          if (response.data.success) {
            // Handle success as needed
          } else {
            console.error(`Failed to add ${assetType} assets. Please try again.`)
          }
        } catch (error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
          } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received from the server')
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up the request:', error.message)
          }
        }
      })

      // Wait for all requests to complete
      await Promise.all(requests)

      // Reset the state or perform any other necessary actions
      setAssetsArray([])

      // Display a success alert
      alert('Assets added to the database successfully!')
    } catch (error) {
      console.error('Error adding assets:', error)
      // Display an error alert for any unexpected errors
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (assetsArray.length > 0) {
        // Importing multiple assets from Excel
        for (const asset of assetsArray) {
          // Convert to JSON format expected by backend
          const assetData = {
            assetName: asset.assetName || '',
            assetType: asset.assetType || '',
            institutionName: asset.institutionName || '',
            department: asset.department || '',
            functionalArea: asset.functionalArea || '',
            manufacturer: asset.manufacturer || '',
            modelNumber: asset.modelNumber || '',
            serialNumber: asset.serialNumber || '',
            location: asset.location || '',
            status: asset.status || 'Active',
            purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
            purchasePrice: parseFloat(asset.purchasePrice) || 0
          }
          
          const response = await axiosInstance.post(endpoints.addAsset, assetData)
          if (response.data.success) {
            // Handle success as needed
          } else {
            console.error('Failed to add asset. Please try again.')
          }
        }
        // Display a success alert
        alert('Assets added successfully!')
      } else {
        // Adding a single asset via the form
        // Convert to JSON format expected by backend
        const requestData = {
          assetName: assetData.assetName || '',
          assetType: assetData.assetType || '',
          institutionName: assetData.institutionName || '',
          department: assetData.department || '',
          functionalArea: assetData.functionalArea || '',
          manufacturer: assetData.manufacturer || '',
          modelNumber: assetData.modelNumber || '',
          serialNumber: assetData.serialNumber || '',
          location: assetData.location || '',
          status: assetData.status || 'Active',
          purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate).toISOString().split('T')[0] : '',
          purchasePrice: parseFloat(assetData.purchasePrice) || 0
        }
        
        console.log('Sending asset data:', requestData)
        const response = await axiosInstance.post(endpoints.addAsset, requestData)
        if (response.data.success) {
          // Reset the form or perform any other necessary actions
          setAssetData({
            assetName: '',
            assetType: '',
            serialNumber: '',
            description: '',
            purchaseDate: null,
            purchasePrice: '',
            marketValue: '',
            manufacturer: '',
            modelNumber: '',
            location: '',
            status: '',
            barcode: '',
            institutionName: '',
            department: '',
            functionalArea: '',
            logo: null,
          })
          // Display a success alert
          alert('Asset added successfully!')
        } else {
          // Display an error alert if the backend indicates a failure
          alert('Failed to add asset. Please try again.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      if (error.response) {
        console.error('Error response:', error.response.data)
        alert(`Error: ${error.response.data.error || error.response.data.message || 'Failed to add asset'}`)
      } else {
        alert('An unexpected error occurred. Please try again.')
      }
    }
  }

  return (
    <div className="add-asset-form" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <Container>
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="mb-2" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            📦 Add New Asset
          </h2>
          <p className="text-muted">Create and manage your organization's assets</p>
        </div>

        {/* Trial Status Alert */}
        {!isTrialActive && (
          <Alert 
            variant="warning" 
            className="border-0 shadow-sm mb-4"
            style={{ borderRadius: '12px' }}
          >
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilWarning} />
              <strong>Trial Expired:</strong> Please purchase a license to continue using the system.
            </div>
          </Alert>
        )}

        {/* Import Section */}
        {isTrialActive && (
          <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px' }}>
            <CardHeader 
              className="bg-white border-0 py-3" 
              style={{ borderRadius: '16px 16px 0 0' }}
            >
              <h5 className="mb-0 fw-bold">
                <CIcon icon={cilCloudUpload} className="me-2" />
                Bulk Import Assets
              </h5>
            </CardHeader>
            <CardBody className="p-4">
              <Row className="align-items-end">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilFile} className="me-2" />
                      Import Excel File
                    </Form.Label>
                    <Form.Control 
                      type="file" 
                      accept=".xlsx" 
                      onChange={handleFileChange}
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={handleDownloadTemplate}
                    style={{ borderRadius: '8px' }}
                  >
                    <CIcon icon={cilCloudDownload} className="me-1" />
                    Template
                  </Button>
                  {assetsArray.length > 0 && (
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={handleAddToDatabase}
                      style={{ borderRadius: '8px' }}
                    >
                      <CIcon icon={cilSave} className="me-1" />
                      Import ({assetsArray.length})
                    </Button>
                  )}
                </Col>
              </Row>
              
              {/* Import Progress */}
              {assetsArray.length > 0 && (
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted">Ready to import</small>
                    <Badge bg="success">{assetsArray.length} assets</Badge>
                  </div>
                  <ProgressBar 
                    now={100} 
                    variant="success" 
                    style={{ height: '6px', borderRadius: '3px' }}
                  />
                </div>
              )}
            </CardBody>
          </Card>
        )}

        {/* Asset Form */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
          <CardHeader 
            className="bg-white border-0 py-3" 
            style={{ borderRadius: '16px 16px 0 0' }}
          >
            <h5 className="mb-0 fw-bold">
              <CIcon icon={cilPlus} className="me-2" />
              Asset Information
            </h5>
          </CardHeader>
          <CardBody className="p-4">
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Form.Group as={Col} md="6" controlId="assetName">
                  <Form.Label className="fw-semibold">
                    <CIcon icon={cilTag} className="me-2" />
                    Asset Name *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="assetName"
                    value={assetData.assetName}
                    onChange={handleChange}
                    placeholder="Enter asset name"
                    style={{ borderRadius: '8px' }}
                    required
                  />
                </Form.Group>
                {isTrialActive && (
                <Form.Group as={Col} md="6" controlId="assetType">
                  <Form.Label className="fw-semibold">
                    <CIcon icon={cilSettings} className="me-2" />
                    Asset Type *
                  </Form.Label>
                  <Form.Control
                    as="select"
                    name="assetType"
                    value={assetData.assetType}
                    onChange={handleChange}
                    style={{ borderRadius: '8px' }}
                    required
                  >
                    <option value="">Select Asset Type</option>
                    {Array.isArray(assetCategories) && assetCategories.length > 0 ? (
                      assetCategories.map((category) => {
                        console.log('Rendering category:', category)
                        return (
                          <option key={category.id} value={category.name}>
                            {category.name || 'Unnamed Category'}
                          </option>
                        )
                      })
                    ) : (
                      <option value="" disabled>
                        {assetCategories.length === 0 ? 'No categories available' : 'Loading categories...'}
                      </option>
                    )}
                  </Form.Control>
                </Form.Group>
                )}
              </Row>

              {isTrialActive && (
              <>
                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="serialNumber">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilBarcode} className="me-2" />
                      Serial Number *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="serialNumber"
                      value={assetData.serialNumber}
                      onChange={handleChange}
                      placeholder="Enter serial number"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>

                  <Form.Group as={Col} md="6" controlId="description">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilInfo} className="me-2" />
                      Description *
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      name="description"
                      value={assetData.description}
                      onChange={handleChange}
                      placeholder="Enter asset description"
                      style={{ borderRadius: '8px' }}
                      rows={3}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="purchaseDate">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilCalendar} className="me-2" />
                      Purchase Date *
                    </Form.Label>
                    <DatePicker
                      selected={assetData.purchaseDate}
                      onChange={(date) => setAssetData({ ...assetData, purchaseDate: date })}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select a date"
                      className="form-control"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md="6" controlId="purchasePrice">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilMoney} className="me-2" />
                      Purchase Price *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="purchasePrice"
                      value={assetData.purchasePrice}
                      onChange={handleChange}
                      placeholder="Enter purchase price"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="marketValue">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilChart} className="me-2" />
                      Market Value *
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="marketValue"
                      value={assetData.marketValue}
                      onChange={handleChange}
                      placeholder="Enter market value"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md="6" controlId="manufacturer">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilBuilding} className="me-2" />
                      Manufacturer *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="manufacturer"
                      value={assetData.manufacturer}
                      onChange={handleChange}
                      placeholder="Enter manufacturer"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="modelNumber">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilTag} className="me-2" />
                      Model Number *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="modelNumber"
                      value={assetData.modelNumber}
                      onChange={handleChange}
                      placeholder="Enter model number"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md="6" controlId="institutionName">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilBuilding} className="me-2" />
                      Institution Name *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="institutionName"
                      value={assetData.institutionName}
                      onChange={handleChange}
                      placeholder="Enter institution name"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="department">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilUser} className="me-2" />
                      Department *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="department"
                      value={assetData.department}
                      onChange={handleChange}
                      placeholder="Enter department"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md="6" controlId="functionalArea">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilSettings} className="me-2" />
                      Functional Area *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="functionalArea"
                      value={assetData.functionalArea}
                      onChange={handleChange}
                      placeholder="Enter functional area"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                </Row>

                <Row className="mb-3">
                  <Form.Group as={Col} md="6" controlId="location">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilLocationPin} className="me-2" />
                      Location *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={assetData.location}
                      onChange={handleChange}
                      placeholder="Enter location"
                      style={{ borderRadius: '8px' }}
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md="6" controlId="logo">
                    <Form.Label className="fw-semibold">
                      <CIcon icon={cilFile} className="me-2" />
                      Asset Logo
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAssetData({ ...assetData, logo: e.target.files[0] })}
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Group>
                </Row>
              </>
              )}

              {/* Submit Button */}
              <div className="text-center mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  className="px-5 py-2"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CIcon icon={cilPlus} className="me-2" />
                  Add Asset
                </Button>
              </div>
            </Form>
          </CardBody>
        </Card>
      </Container>

      {/* Trial Expired Modal */}
      <Modal show={showModal} centered backdrop="static" keyboard={false}>
        <Modal.Header className="bg-warning text-white">
          <Modal.Title>
            <CIcon icon={cilWarning} className="me-2" />
            License Required
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center">
            <CIcon icon={cilShieldAlt} size="3xl" className="text-warning mb-3" />
            <h5>Your trial period has expired</h5>
            <p className="text-muted">
              Please purchase a license to continue using the system and access all features.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="warning" 
            onClick={() => (window.location.href = 'https://moowigroup.com/contact-us/')}
            style={{ borderRadius: '8px' }}
          >
            <CIcon icon={cilMoney} className="me-2" />
            Purchase License
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .add-asset-form {
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
      `}</style>
    </div>
  )
}

export default AddAsset
