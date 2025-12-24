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
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

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

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const roleBadge = getRoleBadge(user?.role)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        <div className="card-body">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Role</p>
                    <span className={`inline-flex items-center px-2.5 py-1 text-sm font-medium rounded-full ${roleBadge.bg} ${roleBadge.text}`}>
                      {roleBadge.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium text-gray-900">
                      {user?.department || '—'}
                    </p>
                  </div>
                </div>
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
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="label">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input pr-11"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="input pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={passwordLoading} className="btn btn-primary">
              {passwordLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Change Password
                </span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* System Information */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">System Information</h2>
        </div>
        <div className="card-body">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Application</p>
              <p className="font-medium text-gray-900">MIS - Work Permit System</p>
            </div>
            <div>
              <p className="text-gray-500">Version</p>
              <p className="font-medium text-gray-900">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-500">Environment</p>
              <p className="font-medium text-gray-900">Production</p>
            </div>
            <div>
              <p className="text-gray-500">Support</p>
              <a href="mailto:support@safetypermit.com" className="font-medium text-primary-600 hover:text-primary-700">
                support@safetypermit.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
