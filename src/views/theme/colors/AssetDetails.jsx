// AssetDetails.jsx
import React from 'react'
import { Card } from 'react-bootstrap'
import PropTypes from 'prop-types'

const AssetDetails = ({ details }) => {
  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>Asset Details</Card.Title>
        <Card.Text>
          {/* Display asset details here */}
          {/* For example: */}
          <p>Asset Name: {details.assetName}</p>
          <p>Asset Type: {details.assetType}</p>
          {/* Add more details as needed */}
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
AssetDetails.propTypes = {
  assetType: PropTypes.string.isRequired, // Specify the expected type and mark it as required
  assetName: PropTypes.string.isRequired,
  details: PropTypes.string.isRequired,
}
export default AssetDetails
