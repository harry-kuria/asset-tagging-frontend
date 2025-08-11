import { endpoints } from '../config/api'

export const getUserRoles = async () => {
  try {
    const response = await fetch(endpoints.userRoles, {
      method: 'GET',
      headers: {
        // Include any headers needed for authentication or authorization
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user roles')
    }

    const userRoles = await response.json()
    return userRoles
  } catch (error) {
    console.error('Error fetching user roles:', error.message)
    return {
      canCreateUsers: false,
      canViewUsers: false,
      canAddAssets: false,
      canEncodeAssets: false,
      canViewReports: false,
    }
  }
}
