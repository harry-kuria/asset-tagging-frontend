export const getUserRoles = async () => {
  try {
    // Simulate an asynchronous API call to fetch user roles
    const response = await fetch('https://profitvision.geolea.com/impact/api/user_roles', {
      method: 'GET',
      headers: {
        // Include any headers needed for authentication or authorization
        // For example, you might include an authentication token
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user roles')
    }

    // Assuming the API returns user roles in JSON format
    const userRoles = await response.json()
    return userRoles
  } catch (error) {
    console.error('Error fetching user roles:', error.message)
    // You might want to handle the error or return default roles
    return {
      canCreateUsers: false,
      canViewUsers: false,
      canAddAssets: false,
      canEncodeAssets: false,
      canViewReports: false,
    }
  }
}
