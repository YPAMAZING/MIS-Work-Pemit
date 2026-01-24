import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Settings,
  Users,
  Shield,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Simple MIS Permission categories
const misPermissions = [
  { key: 'mis.access', name: 'Access MIS', desc: 'Access MIS system' },
  { key: 'mis.dashboard', name: 'View Dashboard', desc: 'View MIS dashboard' },
  { key: 'meters.view', name: 'View Readings', desc: 'View meter readings' },
  { key: 'meters.create', name: 'Create Readings', desc: 'Create meter readings' },
  { key: 'meters.edit', name: 'Edit Readings', desc: 'Edit meter readings' },
  { key: 'meters.delete', name: 'Delete Readings', desc: 'Delete meter readings' },
  { key: 'meters.verify', name: 'Verify Readings', desc: 'Verify meter readings' },
  { key: 'meters.analytics', name: 'View Analytics', desc: 'View analytics' },
  { key: 'meters.export', name: 'Export Data', desc: 'Export meter data' },
]

const MISSettings = ({ initialTab = 'roles' }) => {
  const { user, isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [showNewRoleForm, setShowNewRoleForm] = useState(false)
  const [newRole, setNewRole] = useState({ name: '', displayName: '', description: '', permissions: [] })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    await Promise.all([fetchRoles(), fetchUsers()])
    setLoading(false)
  }

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const allRoles = Array.isArray(response.data) ? response.data : (response.data.roles || [])
      // Filter to MIS-related roles
      const misRoles = allRoles.filter(r => 
        r.name?.includes('MIS') || 
        r.name === 'SITE_ENGINEER' || 
        r.name === 'ADMIN' ||
        r.name === 'FIREMAN' ||
        (Array.isArray(r.permissions) && r.permissions.some(p => p.startsWith?.('mis.') || p.startsWith?.('meters.')))
      )
      setRoles(misRoles.length > 0 ? misRoles : allRoles.slice(0, 10))
    } catch (err) {
      console.error('Error fetching roles:', err)
      if (err.response?.status === 403) {
        setError('You do not have permission to view roles. Contact an administrator.')
      } else {
        setError('Failed to load roles. Please try again.')
      }
      setRoles([])
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const allUsers = response.data.users || []
      const misUsers = allUsers.filter(u => {
        const perms = u.permissions || []
        const role = u.role || u.roleName || ''
        return role.includes('MIS') || role === 'SITE_ENGINEER' || role === 'ADMIN' ||
               perms.some(p => p.startsWith?.('mis.') || p.startsWith?.('meters.'))
      })
      setUsers(misUsers.length > 0 ? misUsers : allUsers.slice(0, 20))
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  const handleSaveRole = async (roleData, isNew = false) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      if (isNew) {
        await axios.post(`${API_URL}/roles`, {
          ...roleData,
          name: roleData.name.toUpperCase().replace(/\s+/g, '_'),
        }, { headers: { Authorization: `Bearer ${token}` } })
        toast.success('Role created')
        setShowNewRoleForm(false)
        setNewRole({ name: '', displayName: '', description: '', permissions: [] })
      } else {
        await axios.put(`${API_URL}/roles/${roleData.id}`, roleData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Role updated')
        setEditingRole(null)
      }
      fetchRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Delete this role?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Role deleted')
      fetchRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting role')
    }
  }

  const togglePermission = (key, isNew = false) => {
    if (isNew) {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(key)
          ? prev.permissions.filter(p => p !== key)
          : [...prev.permissions, key]
      }))
    } else if (editingRole) {
      const perms = editingRole.permissions || []
      setEditingRole(prev => ({
        ...prev,
        permissions: perms.includes(key)
          ? perms.filter(p => p !== key)
          : [...perms, key]
      }))
    }
  }

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Error State (Permission Denied)
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-purple-600 text-white rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">MIS Settings</h1>
        <p className="text-gray-500">Manage MIS roles and user access</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'roles' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
          }`}
        >
          <Shield className="w-4 h-4 inline mr-1" />
          Roles
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'users' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500'
          }`}
        >
          <Users className="w-4 h-4 inline mr-1" />
          Users
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {/* Create Role Button */}
          {isAdmin && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewRoleForm(!showNewRoleForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                Create Role
              </button>
            </div>
          )}

          {/* New Role Form */}
          {showNewRoleForm && (
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
              <h3 className="font-semibold mb-3">New MIS Role</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole(p => ({ ...p, name: e.target.value }))}
                  placeholder="Role Name (e.g., MIS_SUPERVISOR)"
                  className="px-3 py-2 border rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={newRole.displayName}
                  onChange={(e) => setNewRole(p => ({ ...p, displayName: e.target.value }))}
                  placeholder="Display Name"
                  className="px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {misPermissions.map(p => (
                  <label key={p.key} className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer ${
                    newRole.permissions.includes(p.key) ? 'bg-purple-200' : 'bg-white border'
                  }`}>
                    <input
                      type="checkbox"
                      checked={newRole.permissions.includes(p.key)}
                      onChange={() => togglePermission(p.key, true)}
                      className="w-3 h-3"
                    />
                    {p.name}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowNewRoleForm(false); setNewRole({ name: '', displayName: '', description: '', permissions: [] }) }}
                  className="px-3 py-1.5 border rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveRole(newRole, true)}
                  disabled={saving || !newRole.name || !newRole.displayName}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {/* Roles List */}
          <div className="grid md:grid-cols-2 gap-4">
            {roles.map(role => {
              const perms = typeof role.permissions === 'string' ? JSON.parse(role.permissions) : (role.permissions || [])
              const isEditing = editingRole?.id === role.id
              
              return (
                <div key={role.id} className={`bg-white rounded-xl border p-4 ${isEditing ? 'border-purple-400' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-5 h-5 ${role.isSystem ? 'text-blue-600' : 'text-purple-600'}`} />
                      <div>
                        <h3 className="font-semibold text-gray-900">{role.displayName}</h3>
                        <p className="text-xs text-gray-500">{role.name}</p>
                      </div>
                    </div>
                    {!role.isSystem && isAdmin && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingRole(isEditing ? null : { ...role, permissions: perms })}
                          className={`p-1.5 rounded ${isEditing ? 'bg-purple-100' : 'hover:bg-gray-100'}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteRole(role.id)} className="p-1.5 hover:bg-red-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                    {role.isSystem && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">System</span>
                    )}
                  </div>
                  
                  {isEditing ? (
                    <div className="space-y-3 mt-3">
                      <input
                        type="text"
                        value={editingRole.displayName}
                        onChange={(e) => setEditingRole(p => ({ ...p, displayName: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {misPermissions.map(p => (
                          <label key={p.key} className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer ${
                            editingRole.permissions.includes(p.key) ? 'bg-purple-200' : 'bg-gray-100'
                          }`}>
                            <input
                              type="checkbox"
                              checked={editingRole.permissions.includes(p.key)}
                              onChange={() => togglePermission(p.key)}
                              className="w-3 h-3"
                            />
                            {p.name}
                          </label>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingRole(null)} className="px-3 py-1.5 border rounded-lg text-sm">
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveRole(editingRole)}
                          disabled={saving}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {perms.slice(0, 4).map(p => (
                        <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {p.split('.')[1]}
                        </span>
                      ))}
                      {perms.length > 4 && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded-full">
                          +{perms.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {roles.length === 0 && !error && (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No roles found</p>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="font-semibold">MIS Users ({users.length})</h3>
          </div>
          {users.length > 0 ? (
            <div className="divide-y">
              {users.map(u => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium text-sm">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'SITE_ENGINEER' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {u.roleName || u.role?.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No MIS users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MISSettings
