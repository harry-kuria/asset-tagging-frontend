import React, { createContext, useContext, useReducer } from 'react'
import PropTypes from 'prop-types' // Import PropTypes

const AuthContext = createContext()

const initialState = {
  isAuthenticated: false,
  userRoles: {},
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        userRoles: action.payload.userRoles,
      }
    case 'LOGOUT':
      return initialState
    default:
      return state
  }
}

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  return <AuthContext.Provider value={{ state, dispatch }}>{children}</AuthContext.Provider>
}

// Add prop-types validation
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthProvider, useAuth }
