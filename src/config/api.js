// Fixed API base URL
export const API_URL = 'https://graf.moowigroup.com';

// Mode helpers kept for compatibility (not used when API_URL is fixed)
export const getCurrentApiMode = () => {
  return 'production';
};

export const setApiMode = (_mode) => {
  // no-op since API base is fixed
  window.location.reload();
};

// Endpoints
export const endpoints = {
  // Auth
  login: `${API_URL}/api/login`,
  createAccount: `${API_URL}/create-account`,
  checkTrialStatus: `${API_URL}/check-trial-status`,
  
  // Users
  users: `${API_URL}/users`,
  userById: (userId) => `${API_URL}/users/${userId}`,
  addUser: `${API_URL}/addUser`,
  userRoles: `${API_URL}/user_roles`,
  
  // Assets
  assets: `${API_URL}/assets`,
  assetById: (assetId) => `${API_URL}/assets/${assetId}`,
  addAsset: `${API_URL}/addAsset`,
  addMultipleAssets: (assetType) => `${API_URL}/addMultipleAssets/${assetType}`,
  getAssetDetails: (id) => `${API_URL}/getAssetDetails?id=${id}`,
  
  // Barcode / Encoding
  generateBarcodesByInstitutionAndDepartment: `${API_URL}/api/barcodes/institution-department`,
  
  // Categories and Metadata - Updated to use new Grafana API endpoints
  categories: `${API_URL}/api/categories`,
  manufacturers: `${API_URL}/api/manufacturers`,
  institutions: `${API_URL}/api/institutions`,
  departments: `${API_URL}/api/departments`,
  functionalAreas: `${API_URL}/api/functional-areas`,
  
  // Search
  searchAssets: `${API_URL}/searchAssets`,
  
  // Reports
  generateReport: `${API_URL}/api/generateReport`,
  generateInvoice: `${API_URL}/api/reports/invoice`,
  fetchAssetsByInstitution: `${API_URL}/api/fetchAssetsByInstitution`,
  
  // Dashboard endpoints
  userInfo: `${API_URL}/user/info`,
  notifications: `${API_URL}/notifications`,
  recentActivities: `${API_URL}/recent-activities`,
  dashboardStats: `${API_URL}/api/dashboard/stats`,
};

export const getCurrentBaseUrl = () => API_URL; 