import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { user, token } = response.data
    localStorage.setItem('token', token)
    setUser(user)
    return user
  }

  const register = async (data) => {
    const response = await api.post('/auth/register', data)
    
    // Check if registration requires approval
    if (response.data.requiresApproval) {
      // Don't set user or token - they need to wait for approval
      return {
        requiresApproval: true,
        message: response.data.message,
      }
    }
    
    // Requestor role - auto-approved, login immediately
    const { user, token } = response.data
    localStorage.setItem('token', token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }))
  }

  // Check if user has a specific permission
  const hasPermission = (permission) => {
    if (!user) return false
    // Admin has all permissions
    if (user.role === 'ADMIN') return true
    // Check user's permissions array
    return user.permissions?.includes(permission) || false
  }

  // Check if user can approve permits (Admin or any role with approval permission)
  const canApprove = () => {
    if (!user) return false
    if (user.role === 'ADMIN') return true
    if (user.role === 'SAFETY_OFFICER') return true
    // Check for approval permission in custom roles
    return hasPermission('approvals.approve')
  }

  // Check if user can manage users
  const canManageUsers = () => {
    if (!user) return false
    if (user.role === 'ADMIN') return true
    return hasPermission('users.view') || hasPermission('users.edit')
  }

  // Check if user can view all permits (not just their own)
  const canViewAllPermits = () => {
    if (!user) return false
    if (user.role === 'ADMIN') return true
    if (user.role === 'SAFETY_OFFICER') return true
    return hasPermission('permits.view_all')
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    // Role checks (for backward compatibility with system roles)
    isAdmin: user?.role === 'ADMIN',
    isSafetyOfficer: user?.role === 'SAFETY_OFFICER',
    isRequestor: user?.role === 'REQUESTOR',
    isSiteEngineer: user?.role === 'SITE_ENGINEER',
    // Permission-based checks (works with custom roles too)
    hasPermission,
    canApprove,
    canManageUsers,
    canViewAllPermits,
    // User permissions array
    permissions: user?.permissions || [],
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
