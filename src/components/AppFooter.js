import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a href="https://moowigroup.com/" target="_blank" rel="noopener noreferrer">
          Moowi Company
        </a>
        <span className="ms-1">&copy; 2024 </span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://moowigroup.com/" target="_blank" rel="noopener noreferrer">
          Moowi Company Group
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
