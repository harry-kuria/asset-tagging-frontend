import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import { getCurrentApiMode, setApiMode, getCurrentBaseUrl } from '../config/api';

const ApiModeSwitcher = () => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const currentMode = getCurrentApiMode();
  const currentUrl = getCurrentBaseUrl();

  const toggleMode = () => {
    const newMode = currentMode === 'local' ? 'production' : 'local';
    setApiMode(newMode);
  };

  return (
    <div className="api-mode-switcher" style={{ padding: '10px' }}>
      <Badge bg={currentMode === 'local' ? 'warning' : 'primary'} style={{ marginRight: '10px' }}>
        {currentMode.toUpperCase()}
      </Badge>
      <Button 
        size="sm" 
        variant={currentMode === 'local' ? 'outline-warning' : 'outline-primary'}
        onClick={toggleMode}
      >
        Switch to {currentMode === 'local' ? 'Production' : 'Local'}
      </Button>
      <div style={{ fontSize: '0.8em', marginTop: '5px', color: 'gray' }}>
        Current API: {currentUrl}
      </div>
    </div>
  );
};

export default ApiModeSwitcher; 