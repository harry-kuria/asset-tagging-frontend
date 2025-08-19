// ViewReport.jsx
// http://45.79.205.197:5000
import React, { useState, useEffect } from 'react'
import { saveAs } from 'file-saver'
import { Button, Form, Container, Row, Col, ProgressBar } from 'react-bootstrap'
import axios from 'axios'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { endpoints } from '../config/api'
import { showApiError, showApiSuccess } from '../utils/toast'

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

  const handleGenerateReport = async () => {
    try {
      const response = await axiosInstance.get(endpoints.generateReport, {
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
        showApiSuccess('Report generated successfully!')
      } else {
        console.error('Unexpected response format:', response.data)
        showApiError(new Error('Unexpected response format from server'))
      }
    } catch (error) {
      console.error('Error generating report:', error)
      showApiError(error)
    }
  }

  const generateExcelFile = async (reportData) => {
    try {
      // Fetch assets associated with the selected institution
      const assetResponse = await axiosInstance.post(endpoints.fetchAssetsByInstitution, {
        institutionName: filters.institutionName,
      })
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
        if (Object.prototype.hasOwnProperty.call(reportData, assetType)) {
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
        if (Object.prototype.hasOwnProperty.call(filteredReportData, assetType)) {
          const assets = filteredReportData[assetType]
          const totalMarketValue = assets.reduce((sum, asset) => sum + (asset.marketValue || 0), 0)
          summaryData.push([assetType, totalMarketValue.toFixed(2)])
        }
      }

      const summaryWs = XLSX.utils.json_to_sheet([summaryHeaders, ...summaryData])
      XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary')

      // Generate sheets for each asset type
      for (const assetType in filteredReportData) {
        if (Object.prototype.hasOwnProperty.call(filteredReportData, assetType)) {
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
        const response = await axiosInstance.get(endpoints.categories)
        // Ensure we have an array of data
        const data = Array.isArray(response.data) ? response.data : response.data?.data || []
        setAssetCategories(data)
      } catch (error) {
        console.error('Error fetching asset categories:', error)
        showApiError(error)
        setAssetCategories([])
      }
    }

    fetchAssetCategories()
  }, [])

  useEffect(() => {
    const fetchManufacturerCategories = async () => {
      try {
        const manufacturerResponse = await axiosInstance.get(endpoints.manufacturers)
        // Ensure we have an array of data
        const data = Array.isArray(manufacturerResponse.data) ? manufacturerResponse.data : manufacturerResponse.data?.data || []
        setManufacturers(data)
      } catch (error) {
        console.error('Error fetching manufacturer categories:', error)
        showApiError(error)
        setManufacturers([])
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
        const response = await axiosInstance.get(endpoints.institutions)
        // Ensure we have an array of data
        const data = Array.isArray(response.data) ? response.data : response.data?.data || []
        setInstitutionList(data)
      } catch (error) {
        console.error('Error fetching institutions:', error)
        showApiError(error)
        setInstitutionList([])
      }
    }
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get(endpoints.departments)
        // Ensure we have an array of data
        const data = Array.isArray(response.data) ? response.data : response.data?.data || []
        setDepartments(data)
      } catch (error) {
        console.error('Error fetching departments:', error)
        showApiError(error)
        setDepartments([])
      }
    }

    const fetchFunctionalAreas = async () => {
      try {
        const response = await axiosInstance.get(endpoints.functionalAreas)
        // Ensure we have an array of data
        const data = Array.isArray(response.data) ? response.data : response.data?.data || []
        setFunctionalAreas(data)
      } catch (error) {
        console.error('Error fetching functional areas:', error)
        showApiError(error)
        setFunctionalAreas([])
      }
    }

    fetchInstitutions()
    fetchDepartments()
    fetchFunctionalAreas()
  }, [])

  const generatePDFReport = async (assetsByType) => {
    setLoading(true)
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF({ orientation: 'landscape' })

      // Add title for the summary table
      pdf.setFontSize(18)
      pdf.text(`Asset Register of ${filters.institutionName}`, 10, 10)

      const customOrder = [
        'land',
        'building',
        'computer',
        'furniture',
        'electronics',
        'motor vehicle',
        'equipment',
        'biologicalassets',
      ]
      const summaryHeaders = ['Asset Type', 'Total Market Value (Kshs.)']
      const summaryData = []
      let grandTotalMarketValue = 0

      for (const assetType of customOrder) {
        if (Object.prototype.hasOwnProperty.call(assetsByType, assetType)) {
          let totalMarketValue = 0
          if (assetType !== 'land') {
            totalMarketValue = assetsByType[assetType].reduce(
              (sum, asset) => sum + (parseFloat(asset.marketValue) || 0),
              0,
            )
          }
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
              (sum, asset) => sum + (parseFloat(asset.amount) || 0),
              0,
            )
          }

          summaryData.push([
            assetType.toUpperCase(),
            totalMarketValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          ])
          grandTotalMarketValue += totalMarketValue
        }
      }

      summaryData.push([
        { content: 'Grand Total', styles: { fontStyle: 'bold', textColor: [0, 0, 0] } },
        {
          content: grandTotalMarketValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
          styles: { fontStyle: 'bold', textColor: [0, 0, 0] },
        },
      ])

      pdf.autoTable({
        head: [[
          { content: 'Asset Type', styles: { fontStyle: 'bold', fontSize: 10, align: 'left' } },
          { content: 'Total Market Value (Kshs.)', styles: { fontStyle: 'bold', cellPadding: 1, lineHeight: 10, halign: 'right', fontSize: 10 } },
        ]],
        body: summaryData,
        startY: 30,
        margin: { top: 30 },
        bodyStyles: { fontStyle: 'normal', textColor: [0, 0, 0], fontSize: 10 },
        columnStyles: { 0: { align: 'left' }, 1: { halign: 'right' } },
      })

      // Save the PDF
      pdf.save('asset_register.pdf')
    } catch (error) {
      console.error('Error generating asset register report:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProgressIndicator = (percentage) => {
    setTimeout(() => {
      setProgress(percentage)
    }, 500)
  }

  return (
    <Container>
      <h4 className="mb-3">Asset Register Report</h4>
      <Form>
        <Row className="g-2 justify-content-center">
          <Col xs={12} sm={6}>
            <Form.Group controlId="institutionName">
              <Form.Label>Institution Name</Form.Label>
              <Form.Select
                value={filters.institutionName}
                onChange={(e) => handleFilterChange('institutionName', e.target.value)}
              >
                <option value="">All</option>
                {Array.isArray(institutionList) ? institutionList.map((institution) => (
                  <option key={institution} value={institution}>
                    {institution}
                  </option>
                )) : null}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-center align-items-center mt-3">
          <Button variant="primary" onClick={handleGenerateReport}>
            Generate Report
          </Button>

          <Form.Group className="ms-2" controlId="reportFormat">
            <Form.Label className="me-2">Format</Form.Label>
            <Form.Select
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </Form.Select>
          </Form.Group>
        </div>
        {loading && (
          <div className="mt-2">
            <ProgressBar animated now={100} />
          </div>
        )}
      </Form>
    </Container>
  )
}

export default ViewReport
