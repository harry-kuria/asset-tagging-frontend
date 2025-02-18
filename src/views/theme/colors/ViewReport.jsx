// ViewReport.jsx
// http://45.79.205.197:5000
import React, { useState, useEffect } from 'react'
import LinearProgress from '@mui/material/LinearProgress'
import { saveAs } from 'file-saver'
import { Alert, Row, Col, Modal } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  TextField,
  Grid,
  Typography,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { DatePicker } from '@mui/lab'
import { Box } from '@mui/system'
import axios from 'axios'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
const ViewReport = () => {
  const [filters, setFilters] = useState({
    assetType: '',
    location: '',
    status: '',
    startDate: null,
    endDate: null,
    manufacturer: '',
    modelNumber: '',
    institutionName: '',
    department: '',
    functionalArea: '',
  })

  const [assetCategories, setAssetCategories] = useState([])
  const [manufacturers, setManufacturers] = useState([])
  const [selectedAssetType, setSelectedAssetType] = useState('')
  const [institutionList, setInstitutionList] = useState([])
  const [departments, setDepartments] = useState([])
  const [functionalAreas, setFunctionalAreas] = useState([])
  const [reportFormat, setReportFormat] = useState('pdf')
  const [certificateGenerated, setCertificateGenerated] = useState(false)
  const [progress, setProgress] = React.useState(0)
  const [loading, setLoading] = useState(false)
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate()

  const groupAssetsByType = (assets) => {
    const groupedAssets = {}

    for (const asset of assets) {
      const assetType = (asset.assetType || 'Unknown').toLowerCase()

      if (!groupedAssets[assetType]) {
        groupedAssets[assetType] = []
      }

      groupedAssets[assetType].push(asset)
    }

    return groupedAssets
  }

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

    checkTrialStatus();
  }, [navigate]);

  const handleGenerateReport = async () => {
    try {
      const response = await axios.get('https://profitvision.geolea.com/impact/api/generateReport', {
        params: {
          assetType: selectedAssetType,
          location: filters.location,
          status: filters.status,
          startDate: filters.startDate?.toISOString(),
          endDate: filters.endDate?.toISOString(),
          manufacturer: filters.manufacturer,
          modelNumber: filters.modelNumber,
          institutionName: filters.institutionName,
          department: filters.department,
          functionalArea: filters.functionalArea,
        },
      })

      if (Array.isArray(response.data)) {
        // Organize assets by asset type
        const assetsByType = groupAssetsByType(response.data)

        console.log('Report data:', assetsByType)
        if (reportFormat === 'pdf') {
          generatePDFReport(assetsByType)
        } else if (reportFormat === 'excel') {
          generateExcelFile(assetsByType)
        }
      } else {
        console.error('Unexpected response format:', response.data)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const generateExcelFile = async (reportData) => {
    try {
      // Fetch assets associated with the selected institution
      const assetResponse = await axios.post(
        'http://45.79.205.197:5000/api/fetchAssetsByInstitution',
        {
          institutionName: filters.institutionName,
        },
      )
      const { success, assets } = assetResponse.data

      if (!success) {
        console.error('Error fetching assets:', assets)
        return
      }

      const wb = XLSX.utils.book_new()

      // Handle different data formats
      if (!reportData || typeof reportData !== 'object') {
        console.error('Unexpected response format:', reportData)
        return
      }

      // Filter reportData based on the selected institution
      const filteredReportData = {}
      for (const assetType in reportData) {
        if (reportData.hasOwnProperty(assetType)) {
          const assetsOfType = reportData[assetType].filter(
            (asset) => asset.institutionName === filters.institutionName,
          )
          if (assetsOfType.length > 0) {
            filteredReportData[assetType] = assetsOfType
          }
        }
      }

      // Generate summary sheet
      const summaryHeaders = ['Asset Type', 'Total Market Value (Kshs.)']
      const summaryData = []

      for (const assetType in filteredReportData) {
        if (filteredReportData.hasOwnProperty(assetType)) {
          const assets = filteredReportData[assetType]
          const totalMarketValue = assets.reduce((sum, asset) => sum + (asset.marketValue || 0), 0)
          summaryData.push([assetType, totalMarketValue.toFixed(2)])
        }
      }

      const summaryWs = XLSX.utils.json_to_sheet([summaryHeaders, ...summaryData])
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

      // Generate sheets for each asset type
      for (const assetType in filteredReportData) {
        if (filteredReportData.hasOwnProperty(assetType)) {
          const assets = filteredReportData[assetType]

          console.log(`Asset Type: ${assetType}, Number of Assets: ${assets.length}`)

          // Dynamic headers based on available properties
          const headers = Object.keys(assets[0])

          // Filter out columns with empty headers
          const nonEmptyHeaders = headers.filter((header) => header.trim() !== '')

          // Filter out columns with no data
          const nonEmptyData = assets.map((asset) => {
            return nonEmptyHeaders.map((header) => asset[header])
          })

          // Filter out columns that are entirely empty
          const nonEmptyColumns = nonEmptyHeaders.filter((_, index) =>
            nonEmptyData.some(
              (row) => row[index] !== undefined && row[index] !== null && row[index] !== '',
            ),
          )

          // Ensure the header row is added separately
          const assetClassWsData = [
            nonEmptyColumns,
            ...nonEmptyData.map((row) =>
              nonEmptyColumns.map((header) => row[nonEmptyHeaders.indexOf(header)]),
            ),
          ]
          const assetClassWs = XLSX.utils.aoa_to_sheet(assetClassWsData)
          XLSX.utils.book_append_sheet(wb, assetClassWs, assetType)
        }
      }

      if (wb.SheetNames.length === 0) {
        console.error('Workbook is empty. Check the structure of reportData.')
        return
      }

      XLSX.writeFile(wb, 'asset_report.xlsx')
    } catch (error) {
      console.error('Error generating Excel file:', error)
    }
  }
  useEffect(() => {
    const fetchAssetCategories = async () => {
      try {
        const response = await axios.get('https://profitvision.geolea.com/impact/api/categories')
        setAssetCategories(response.data)
      } catch (error) {
        console.error('Error fetching asset categories:', error)
      }
    }

    fetchAssetCategories()
  }, [])

  useEffect(() => {
    const fetchManufacturerCategories = async () => {
      try {
        const manufacturerResponse = await axios.get('https://profitvision.geolea.com/impact/api/manufacturers')
        setManufacturers(manufacturerResponse.data)
      } catch (error) {
        console.error('Error fetching manufacturer categories:', error)
      }
    }

    fetchManufacturerCategories()
  }, [])

  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [field]: value }))
  }

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await axios.get('https://profitvision.geolea.com/impact/api/institutions')
        setInstitutionList(response.data)
      } catch (error) {
        console.error('Error fetching institutions:', error)
      }
    }
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('https://profitvision.geolea.com/impact/api/departments')
        setDepartments(response.data)
      } catch (error) {
        console.error('Error fetching departments:', error)
      }
    }

    const fetchFunctionalAreas = async () => {
      try {
        const response = await axios.get('https://profitvision.geolea.com/impact/api/functionalAreas')
        setFunctionalAreas(response.data)
      } catch (error) {
        console.error('Error fetching functional areas:', error)
      }
    }

    fetchInstitutions()
    fetchDepartments()
    fetchFunctionalAreas()

    fetchInstitutions()
  }, [])

  const generatePDFReport = async () => {
    setLoading(true)
    try {
      // Fetch assets associated with the selected institution
      const assetResponse = await axios.post('https://profitvision.geolea.com/impact/api/fetchAssetsByInstitution', {
        institutionName: filters.institutionName,
      })
      console.log('Fetched assets:', assetResponse.data)

      const { success, assets } = assetResponse.data

      if (!success) {
        console.error('Error fetching assets:', assets)
        return
      }
      console.log('Sample market values:')
      assets.slice(0, 5).forEach((asset) => {
        console.log(asset.marketValue)
      })
      // Group assets by assetType
      const assetsByType = groupAssetsByType(assets)

      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'landscape',
      })

      // Add title for the summary table
      pdf.setFontSize(18)
      pdf.text(`Asset Register of ${filters.institutionName}`, 10, 10)

      // Create a summary table with columns for each asset type

      const customOrder = [
        'land',
        'building',
        'computer',
        'furniture',
        'electronics',
        'motorvehicle',
        'motor cycle',
        'equipment',
        'biologicalassets',
        'intangibleassets',
      ]
      const summaryHeaders = ['Asset Type', 'Total Market Value (Kshs.)']
      const summaryData = []
      let grandTotalMarketValue = 0 // Initialize grand total
      // Iterate through the custom order
      for (const assetType of customOrder) {
        if (assetsByType.hasOwnProperty(assetType)) {
          // Calculate total market value for the asset type
          let totalMarketValue = 0

          // Sum up market value for non-land assets
          if (assetType === 'computer') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.marketValue) / 2 || 0),
              0,
            )
          }

          if (assetType === 'furniture') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.marketValue) / 2 || 0),
              0,
            )
          }
          if (assetType === 'equipment') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.marketValue) / 2 || 0),
              0,
            )
          }

          // Add disposal value for land assets
          if (assetType === 'land') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.disposal_value) || 0),
              0,
            )
          }

          if (assetType === 'building') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.valuation) || 0),
              0,
            )
          }
          if (assetType === 'motorvehicle') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.marketValue) / 2 || 0),
              0,
            )
          }
          if (assetType === 'biologicalassets') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.marketValue) || 0),
              0,
            )
          }
          if (assetType === 'intangibleassets') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.marketValue) || 0),
              0,
            )
          }

          // Add data to the summary table
          summaryData.push([
            assetType.toUpperCase(),
            totalMarketValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          ])
          // Accumulate grand total
          grandTotalMarketValue += totalMarketValue
        }
      }

      // Add a row for the grand total
      summaryData.push([
        { content: 'Grand Total', styles: { fontStyle: 'bold', textColor: [0, 0, 0] } }, // Bold and black text
        {
          content: grandTotalMarketValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          styles: { fontStyle: 'bold', textColor: [0, 0, 0] },
        }, // Bold and black text
      ])

      // AutoTable to generate the summary table on the first page
      pdf.autoTable({
        head: [
          [
            { content: 'Asset Type', styles: { fontStyle: 'bold', fontSize: 10, align: 'left' } },
            {
              content: 'Total Market Value (Kshs.)',
              styles: {
                fontStyle: 'bold',
                cellPadding: 1,
                lineHeight: 10,
                halign: 'right',
                fontSize: 10,
              },
            },
          ],
        ],

        body: summaryData,
        startY: 30, // Adjust startY as needed
        margin: { top: 30 },
        bodyStyles: { fontStyle: 'normal', textColor: [0, 0, 0], fontSize: 10 }, // Default style for the table body
        columnStyles: {
          0: { fontStyle: 'normal', textColor: [0, 0, 0], cellWidth: 'auto', align: 'left' }, // Style for the first column
          1: {
            fontStyle: 'normal',
            textColor: [0, 0, 0],
            cellPadding: 1,
            lineHeight: 10,
            halign: 'right',
          }, // Style for the second column (total market value)
        },
        //styles: { cellPadding: 1, lineHeight: 10, halign: 'right' },
      })
      const currentDate = new Date()

      // Format the date as needed
      const formattedDate = `${currentDate.getDate()}/${
        currentDate.getMonth() + 1
      }/${currentDate.getFullYear()}`
      pdf.setFontSize(15)
      const preparedByText =
        'Prepared by\nMoowi Company Group Limited\nP.o Box 13977-00400\nNairobi\n'
      const textWidth =
        (pdf.getStringUnitWidth(preparedByText) * pdf.internal.getFontSize()) /
        pdf.internal.scaleFactor
      const textX = pdf.internal.pageSize.width / 2
      pdf.text(preparedByText + formattedDate, textX, pdf.lastAutoTable.finalY + 20, {
        align: 'center',
      }) // Center-justify the text

      // Add a new page for each asset type
      for (const assetType in assetsByType) {
        if (assetsByType.hasOwnProperty(assetType)) {
          // Add a new page for each assetType
          pdf.addPage()

          // Add letterhead or any content for each page if needed
          pdf.setFontSize(10)
          pdf.text(`${assetType}`, 10, 10)

          // Table headers
          const headers = [
            'Asset Name',
            'Tag No.',
            'Class',
            'Location',
            'Purchase Price (Kshs.)',
            'Market Value/Revalued Amount',
            'Model Type',
            'Department',
            'Functional Area',
            'Serial Number',
            'Vehicle Reg No',
            'Source of funds',
            'Engine Number',
            'Chassis Number',
            'Make',
            'Purchase year',
            'PVNumber',
            'Original Location',
            'Current Location',
            'Replacement Date',
            'Amount',
            'Depreciation Rate',
            'Annual Depreciation',
            'Accumulated Depreciation',
            'Netbook Value',
            'Disposal Date',
            'Responsible Officer',
            'Asset Condition',
            'Description',
            'Ownership',
            'Institution Number',
            'Nearest Town',
            'Street',
            'County',
            'LR Certificate Number',
            'Size',
            'Ownership Status',
            'Mode of Acquisition',
            'Building Type',
            'Designated Use',
            'Number of floors',
            'Area',
            'Valuation',
            'Annual Depreceation',
            'Estimated Useful Life',
            'Accumulated Depreceation Rate',
            'Netbook Value',
            'Annual Rental Income',
            'Land Description',
            'Mode of Acquisition',
            'County',
            'Nearest Town',
            'GPS',
            'Polygon',
            'LR Certificate No.',
            'Ownership Document',
            'Ownership Details',
            'Size',
            'Ownership Status',
            'Acquisition Date',
            'Registration Date',
            'Disputed/Undisputed',
            'Encumberances',
            'Planned/Unplanned',
            'Purpose',
            'Surveyed/Not Surveyed',
            'Acquisition Amount',
            'Fair Value',
            'Disposal Date',
            'Disposal Value',
            'Annual Rental Income of Land',
          ]

          // Table data
          const data = assetsByType[assetType].map((asset) => [
            asset.assetName || '',
            asset.formattedString || '',
            asset.assetType || '',
            asset.location || '',
            asset.purchasePrice || '',
            asset.marketValue || '',
            asset.manufacturer || '',
            asset.department || '',
            asset.functionalArea || '',
            asset.serialNumber || '',
            asset.vehicleregno || '',
            asset.sourceoffunds || '',
            asset.enginenumber || '',
            asset.chassisnumber || '',
            asset.make || '',
            asset.purchaseyear || '',
            asset.pvnumber || '',
            asset.originallocation || '',
            asset.currentlocation || '',
            asset.replacementdate || '',
            asset.amount || '',
            asset.depreciationrate || '',
            asset.annualdepreciation || '',
            asset.accumulateddepreciation || '',
            asset.netbookvalue || '',
            asset.disposaldate || '',
            asset.responsibleofficer || '',
            asset.assetcondition || '',
            asset.description || '',
            asset.ownership || '',
            asset.institutionno || '',
            asset.nearesttown || '',
            asset.street || '',
            asset.county || '',
            asset.lrno || '',
            asset.sizeofland || '',
            asset.ownershipstatus || '',
            asset.sourceoffunds || '',
            asset.modeofacquisition || '',
            asset.buildingtype || '',
            asset.designateduse || '',
            asset.nooffloors || '',
            asset.area || '',
            asset.valuation || '',
            asset.annualdepreciation || '',
            asset.estimatedusefullife || '',
            asset.accumulateddepreciationrate || '',
            asset.netbookvalue || '',
            asset.annualrentalincome || '',
            asset.land_description || '',
            asset.mode_of_acquisition || '',
            asset.nearest_town_location || '',
            asset.gps || '',
            asset.polygon || '',
            asset.lr_certificate_no || '',
            asset.document_of_ownership || '',
            asset.ownership_details || '',
            asset.size_ha || '',
            asset.ownership_status || '',
            asset.acquisition_date || '',
            asset.registration_date || '',
            asset.disputed_undisputed || '',
            asset.encumbrances || '',
            asset.planned_unplanned || '',
            asset.purpose_use_of_land || '',
            asset.surveyed_not_surveyed || '',
            asset.acquisition_amount || '',
            asset.fair_value_ministry_of_lands || '',
            asset.disposal_date_change_of_use_date || '',
            asset.disposal_value || '',
            asset.annual_rental_income || '',
          ])

          // Filter out columns with all empty values
          const filteredHeaders = headers.filter((_, index) =>
            data.some((row) => row[index] !== ''),
          )
          const filteredData = data.map((row) => row.filter((value) => value !== ''))
          const columnWidths = {
            0: 16, // Asset Name
            1: 20, // Tag No.
            2: 10, // Class
            3: 10, // Location
            4: 10, // Purchase Price (Kshs.)
            5: 10, // Market Value/Revalued Amount
            // ... set widths for other columns
          }

          // Define styles for each column
          const columnStyles = {}
          filteredHeaders.forEach((header, index) => {
            columnStyles[index] = { cellWidth: columnWidths[index] || 'auto' }
          })

          // AutoTable to generate the table
          pdf.autoTable({
            head: [filteredHeaders],
            body: filteredData,
            startY: 45, // Adjust as needed
            margin: { top: 45 }, // Adjust top margin for the table
            styles: { fontSize: 8 }, // Set the font size for the table content
            columnStyles: columnStyles, // Set the column widths
          })
        }
      }

      // Save the PDF
      pdf.save('asset_register.pdf')
    } catch (error) {
      console.error('Error generating asset register report:', error)
    } finally {
      // Reset the progress when the process is complete
      setLoading(false)
    }
  }
  const updateProgressIndicator = (percentage) => {
    console.log('Updating progress:', percentage)
    // Add a delay to make the progress indicator more noticeable
    setTimeout(() => {
      setProgress(percentage)
    }, 500) // Adjust the delay time as needed
  }
  const handleGenerateCertificate = async () => {
    setLoading(true)
    try {
      console.log('Starting certificate generation...')
      // Fetch assets associated with the selected institution
      const assetResponse = await axios.post('https://profitvision.geolea.com/impact/api/fetchAssetsByInstitution', {
        institutionName: filters.institutionName,
      })

      const { success, assets } = assetResponse.data

      if (!success) {
        console.error('Error fetching assets:', assets)
        return
      }

      // Group assets by assetType
      const assetsByType = groupAssetsByType(assets)
      console.log(assetsByType)
      console.log(assets[0]) // Log the first asset
      console.log(assets[1])
      // Calculate totals for both "Land" and "Buildings" asset types
      const landTotal = calculateAssetTypeTotal(assetsByType, 'land', 'disposal_value')
      const buildingTotal = calculateAssetTypeTotal(assetsByType, 'building', 'valuation')
      const biologicalAssetsTotal = calculateAssetTypeTotal(
        assetsByType,
        'biologicalassets',
        'marketValue',
      )
      const intangibleAssetsTotal = calculateAssetTypeTotal(
        assetsByType,
        'intangibleassets',
        'marketValue',
      )
      const furnitureTotal = calculateAssetTypeTotal(assetsByType, 'furniture', 'marketValue') / 2
      const computerTotal = calculateAssetTypeTotal(assetsByType, 'computer', 'marketValue') / 2
      const equipmentTotal = calculateAssetTypeTotal(assetsByType, 'equipment', 'marketValue') / 2
      const mvTotal = calculateAssetTypeTotal(assetsByType, 'motorvehicle', 'marketValue') / 2
      const grandTotal =
        landTotal +
        buildingTotal +
        furnitureTotal +
        computerTotal +
        mvTotal +
        equipmentTotal +
        biologicalAssetsTotal +
        intangibleAssetsTotal
      console.log('Land Total:', landTotal.toLocaleString())
      console.log('Building Total:', buildingTotal.toLocaleString())
      const totalLandAndBuildings = landTotal + buildingTotal
      const fCEBIM = furnitureTotal + computerTotal + 0 + 0 + mvTotal
      const institution = filters.institutionName
      // Send a POST request to the generateInvoice endpoint with both totals
      console.log('Before API call')
      const generateInvoiceResponse = await axios.post(
        'https://profitvision.geolea.com/impact/api/generate_invoice',
        {
          landTotal,
          buildingTotal,
          biologicalAssetsTotal,
          intangibleAssetsTotal,
          furnitureTotal,
          computerTotal,
          mvTotal,
          equipmentTotal,
          grandTotal,
          totalLandAndBuildings,
          institution,
          fCEBIM,
        },
        {
          responseType: 'arraybuffer',

          onDownloadProgress: (progressEvent) => {
            // Calculate the download percentage
            const percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100)

            // Update your progress indicator (you need to implement this part)
            updateProgressIndicator(percentage)
          },
        },
      )
      console.log('API call successful')
      const invoiceBlob = new Blob([generateInvoiceResponse.data], { type: 'application/pdf' })
      saveAs(invoiceBlob, 'Moowi_Valuation_Certificate.pdf')
      console.log('pdf is ' + invoiceBlob)
      // Create a URL for the Blob
      const invoiceUrl = window.URL.createObjectURL(invoiceBlob)
      const a = document.createElement('a')
      a.href = invoiceUrl
      a.target = '_blank' // Open in a new tab
      a.rel = 'noopener noreferrer' // Security best practice
      // Create a link element

      // Append the link to the document
      document.body.appendChild(a)

      // Trigger a click on the link to start the download
      a.click()

      // Remove the link from the document
      document.body.removeChild(a)

      console.log('Invoice downloaded successfully!')
    } catch (error) {
      console.error('Error generating or downloading invoice:', error)
    } finally {
      // Reset the progress when the process is complete
      setLoading(false)
    }
  }

  // Helper function to calculate the total for a specific asset type
  const calculateAssetTypeTotal = (assetsByType, assetType, property) => {
    const assetTypeAssets = assetsByType[assetType] || []
    const assetTypeTotal = assetTypeAssets.reduce((sum, asset) => {
      const propertyValue = asset[property]
      const trimmedValue = String(propertyValue).trim() // Convert to string and trim
      const parsedValue = parseFloat(trimmedValue) || 0
      return sum + parsedValue
    }, 0)

    return assetTypeTotal
  }

  return (
    <Container>
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
      
      <Typography variant="h4" gutterBottom>
        Asset Register Report
      </Typography>
      {isTrialActive && (
      <form>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="institutionNameLabel">Institution Name</InputLabel>
              <Select
                labelId="institutionNameLabel"
                id="institutionName"
                value={filters.institutionName}
                onChange={(e) => handleFilterChange('institutionName', e.target.value)}
                label="Institution Name"
              >
                <MenuItem value="">All</MenuItem>
                {institutionList.map((institution) => (
                  <MenuItem key={institution} value={institution}>
                    {institution}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          {/* Center the button */}
          <Button type="button" variant="contained" color="primary" onClick={handleGenerateReport}>
            Generate Report
          </Button>
          <FormControl fullWidth variant="outlined" sx={{ marginLeft: 2 }}>
            <Select
              labelId="reportFormatLabel"
              id="reportFormat"
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
              label="Report Format"
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
            </Select>
          </FormControl>
          {/*
          <Button
            type="button"
            variant="contained"
            color="secondary"
            onClick={handleGenerateCertificate}
            sx={{ marginLeft: 2 }}
          >
            Generate Certificate
          </Button>
          */}
          {console.log('certificateGenerated:', certificateGenerated)}
        </Box>
        {loading && <LinearProgress variant="indeterminate" sx={{ width: '100%', marginTop: 2 }} />}
      </form>
      )}
    </Container>
  )
}

export default ViewReport
