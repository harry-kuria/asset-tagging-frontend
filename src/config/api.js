// Fixed API base URL
export const API_URL = 'http://ec2-54-147-71-214.compute-1.amazonaws.com:5000';

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
  login: `${API_URL}/login`,
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
  generateBarcodesByInstitutionAndDepartment: `${API_URL}/generateBarcodesByInstitutionAndDepartment`,
  
  // Categories and Metadata
  categories: `${API_URL}/categories`,
  manufacturers: `${API_URL}/manufacturers`,
  institutions: `${API_URL}/institutions`,
  departments: `${API_URL}/departments`,
  functionalAreas: `${API_URL}/functionalAreas`,
  
  // Search
  searchAssets: `${API_URL}/searchAssets`,
  
  // Reports
  generateReport: `${API_URL}/generateReport`,
  generateInvoice: `${API_URL}/generate_invoice`,
  fetchAssetsByInstitution: `${API_URL}/fetchAssetsByInstitution`,
  
  // Dashboard endpoints
  userInfo: `${API_URL}/user/info`,
  notifications: `${API_URL}/notifications`,
  recentActivities: `${API_URL}/recent-activities`,
  dashboardStats: `${API_URL}/dashboard/stats`,
  assetStats: `${API_URL}/assets/stats`,
  userStats: `${API_URL}/users/stats`,
  barcodeStats: `${API_URL}/barcodes/stats`,
  reportStats: `${API_URL}/reports/stats`,
};

export const getCurrentBaseUrl = () => API_URL; 