import React, { useState, useEffect } from 'react'
import { Form, Button, Col, Row,Modal } from 'react-bootstrap'
import axios from 'axios'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import * as XLSX from 'xlsx'
import { useNavigate } from 'react-router-dom'
import { endpoints } from '../../../config/api'

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
        const response = await axios.get(endpoints.categories)
        setAssetCategories(response.data)
      } catch (error) {
        console.error('Error fetching asset categories:', error)
      }
    }
    fetchAssetCategories()
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
          const response = await axios.post(endpoints.addMultipleAssets(assetType), assets)
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
          const formattedDate = new Date(asset.purchaseDate)
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')
          const formData = new FormData()
          Object.entries(asset).forEach(([key, value]) => {
            if (key === 'logo') {
              formData.append('logo', value)
            } else {
              formData.append(key, value)
            }
          })
          const response = await axios.post(endpoints.addAsset, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
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
        const dateObject = new Date(assetData.purchaseDate)
        const formattedDate = dateObject.toISOString().slice(0, 19).replace('T', ' ')
        const formData = new FormData()
        Object.entries(assetData).forEach(([key, value]) => {
          if (key === 'logo') {
            formData.append('logo', value)
          } else {
            formData.append(key, value)
          }
        })
        const response = await axios.post(endpoints.addAsset, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
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
      alert('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
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
      <h2 className="mb-2">Add New Asset</h2>
      <div className="mb-3">
        <Button variant="link" size="sm" onClick={handleDownloadTemplate}>
          Download Template
        </Button>
      </div>
      {isTrialActive && (
      <Row className="mb-3">
        <Form.Group as={Col} md="6" controlId="excelFile">
          <Form.Label>Import Excel File</Form.Label>
          <Form.Control type="file" accept=".xlsx" onChange={handleFileChange} />
        </Form.Group>

        {/* Button to add imported assets to the database */}
        {assetsArray.length > 0 && (
          <Button type="button" className="btn-primary" onClick={handleAddToDatabase}>
            Add Imported Assets to Database
          </Button>
        )}
      </Row>
      )}
      <Row className="mb-3">
        <Form.Group as={Col} md="6" controlId="assetName">
          <Form.Label>Asset Name</Form.Label>
          <Form.Control
            type="text"
            name="assetName"
            value={assetData.assetName}
            onChange={handleChange}
            placeholder="Enter asset name"
            required
          />
        </Form.Group>
        {isTrialActive && (
        <Form.Group as={Col} md="6" controlId="assetType">
          <Form.Label>Asset Type</Form.Label>
          <Form.Control
            as="select"
            name="assetType"
            value={assetData.assetType}
            onChange={handleChange}
            required
          >
            <option value="">Select Asset Type</option>
            {assetCategories.map((category) => (
              <option key={category.id} value={category.category_name}>
                {category.category_name}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        )}
      </Row>

      {isTrialActive && (
      <Row className="mb-3">
        {/* Add more Form.Group components for other fields */}
        {/* For example: */}
        <Form.Group as={Col} md="6" controlId="serialNumber">
          <Form.Label>Serial Number</Form.Label>
          <Form.Control
            type="text"
            name="serialNumber"
            value={assetData.serialNumber}
            onChange={handleChange}
            placeholder="Enter serial number"
            required
          />
        </Form.Group>

        <Form.Group as={Col} md="6" controlId="description">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            value={assetData.description}
            onChange={handleChange}
            placeholder="Enter asset description"
            required
          />
        </Form.Group>

        <Form.Group as={Col} md="6" controlId="purchaseDate">
          <Form.Label>Purchase Date</Form.Label>
          <DatePicker
            selected={assetData.purchaseDate}
            onChange={(date) => setAssetData({ ...assetData, purchaseDate: date })}
            dateFormat="MM/dd/yyyy"
            placeholderText="Select a date"
            className="form-control"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="purchasePrice">
          <Form.Label>Purchase Price</Form.Label>
          <Form.Control
            type="text"
            name="purchasePrice"
            value={assetData.purchasePrice}
            onChange={handleChange}
            placeholder="Enter Purchase Price"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="marketValue">
          <Form.Label>Market Value</Form.Label>
          <Form.Control
            type="text"
            name="marketValue"
            value={assetData.marketValue}
            onChange={handleChange}
            placeholder="Enter Market Value"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="manufacturer">
          <Form.Label>Manufacturer</Form.Label>
          <Form.Control
            type="text"
            name="manufacturer"
            value={assetData.manufacturer}
            onChange={handleChange}
            placeholder="Enter Manufacturer"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="modelNumber">
          <Form.Label>Model Number</Form.Label>
          <Form.Control
            type="text"
            name="modelNumber"
            value={assetData.modelNumber}
            onChange={handleChange}
            placeholder="Enter Model Number"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="institutionName">
          <Form.Label>Institution Name</Form.Label>
          <Form.Control
            type="text"
            name="institutionName"
            value={assetData.institutionName}
            onChange={handleChange}
            placeholder="Enter name of Institution"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="department">
          <Form.Label>Department</Form.Label>
          <Form.Control
            type="text"
            name="department"
            value={assetData.department}
            onChange={handleChange}
            placeholder="Enter Department"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="functionalArea">
          <Form.Label>Functional Area</Form.Label>
          <Form.Control
            type="text"
            name="functionalArea"
            value={assetData.functionalArea}
            onChange={handleChange}
            placeholder="Enter Functional Area"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="location">
          <Form.Label>Location</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={assetData.location}
            onChange={handleChange}
            placeholder="Enter Location"
            required
          />
        </Form.Group>
        <Form.Group as={Col} md="6" controlId="logo">
          <Form.Label>Logo</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setAssetData({ ...assetData, logo: e.target.files[0] })}
          />
        </Form.Group>
      </Row>
      )}

      {/* Add more Form.Group components for other fields */}
      <Button type="submit" className="btn-primary" onClick={handleSubmit}>
        Add Asset
      </Button>
    </Form>
  )
}

export default AddAsset
