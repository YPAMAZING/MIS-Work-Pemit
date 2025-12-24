import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import {
  User,
  Mail,
  Building,
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react'

const Settings = () => {
  const { user } = useAuth()
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Administrator' },
      SAFETY_OFFICER: { bg: 'bg-green-100', text: 'text-green-700', label: 'Safety Officer' },
      REQUESTOR: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Requestor' },
    }
    return badges[role] || badges.REQUESTOR
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      toast.success('Password changed successfully')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setErrors({})
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password')
    } finally {
      setLoading(false)
    }
  }

  const roleBadge = getRoleBadge(user?.role)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        <div className="card-body">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <span className={`inline-flex items-center px-3 py-1 mt-2 text-sm font-medium rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                <Shield className="w-4 h-4 mr-1" />
                {roleBadge.label}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Building className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                <p className="font-medium text-gray-900">{user?.department || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="card-header flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    if (errors.currentPassword) setErrors({ ...errors, currentPassword: null })
                  }}
                  className={`input pr-11 ${errors.currentPassword ? 'input-error' : ''}`}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                    if (errors.newPassword) setErrors({ ...errors, newPassword: null })
                  }}
                  className={`input pr-11 ${errors.newPassword ? 'input-error' : ''}`}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null })
                  }}
                  className={`input pr-11 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Changing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Change Password
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Role Permissions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Role Permissions</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {user?.role === 'ADMIN' && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2">Administrator Access</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Full access to all system features</li>
                  <li>• Manage users and roles</li>
                  <li>• View and manage all permits</li>
                  <li>• Access approval workflows</li>
                  <li>• View audit logs</li>
                </ul>
              </div>
            )}
            {user?.role === 'SAFETY_OFFICER' && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900 mb-2">Safety Officer Access</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• View all permit requests</li>
                  <li>• Approve or reject permits</li>
                  <li>• Add comments to approvals</li>
                  <li>• View dashboard statistics</li>
                  <li>• Create own permits</li>
                </ul>
              </div>
            )}
            {user?.role === 'REQUESTOR' && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Requestor Access</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Create new permit requests</li>
                  <li>• View own permits only</li>
                  <li>• Edit pending permits</li>
                  <li>• Track permit status</li>
                  <li>• View personal dashboard</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
