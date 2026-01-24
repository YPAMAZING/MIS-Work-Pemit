import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Settings,
  Users,
  Shield,
  Key,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  UserPlus,
  Lock,
  Unlock,
  Camera,
  BarChart3,
  FileText,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// MIS Permission categories
const misPermissionCategories = [
  {
    name: 'MIS Access',
    description: 'Core MIS system access',
    permissions: [
      { key: 'mis.access', name: 'Access MIS System', description: 'Can access the MIS system' },
      { key: 'mis.dashboard', name: 'View MIS Dashboard', description: 'Can view MIS dashboard' },
      { key: 'mis.settings', name: 'Manage MIS Settings', description: 'Can manage MIS system settings' },
    ],
  },
  {
    name: 'Meter Readings',
    description: 'Meter reading management',
    permissions: [
      { key: 'meters.view', name: 'View Meter Readings', description: 'Can view meter readings' },
      { key: 'meters.view_all', name: 'View All Readings', description: 'Can view all meter readings' },
      { key: 'meters.view_own', name: 'View Own Readings', description: 'Can view own meter readings' },
      { key: 'meters.create', name: 'Create Readings', description: 'Can create new meter readings' },
      { key: 'meters.edit', name: 'Edit Readings', description: 'Can edit any meter readings' },
      { key: 'meters.edit_own', name: 'Edit Own Readings', description: 'Can edit own meter readings' },
      { key: 'meters.delete', name: 'Delete Readings', description: 'Can delete any meter readings' },
      { key: 'meters.delete_own', name: 'Delete Own Readings', description: 'Can delete own meter readings' },
      { key: 'meters.verify', name: 'Verify Readings', description: 'Can verify meter readings' },
      { key: 'meters.ocr', name: 'Use OCR Upload', description: 'Can use OCR image upload' },
    ],
  },
  {
    name: 'Analytics & Reports',
    description: 'Analytics and reporting',
    permissions: [
      { key: 'meters.analytics', name: 'View Analytics', description: 'Can view meter analytics' },
      { key: 'meters.export', name: 'Export Data', description: 'Can export meter data' },
      { key: 'meters.import', name: 'Import Data', description: 'Can bulk import readings' },
      { key: 'reports.view', name: 'View Reports', description: 'Can view reports' },
      { key: 'reports.create', name: 'Generate Reports', description: 'Can generate reports' },
      { key: 'reports.export', name: 'Export Reports', description: 'Can export reports' },
    ],
  },
  {
    name: 'Transmitter Data',
    description: 'Transmitter data management',
    permissions: [
      { key: 'transmitters.view', name: 'View Transmitters', description: 'Can view transmitter data' },
      { key: 'transmitters.view_all', name: 'View All Transmitters', description: 'Can view all transmitter data' },
      { key: 'transmitters.create', name: 'Create Transmitter Data', description: 'Can create transmitter readings' },
      { key: 'transmitters.edit', name: 'Edit Transmitter Data', description: 'Can edit transmitter data' },
      { key: 'transmitters.delete', name: 'Delete Transmitter Data', description: 'Can delete transmitter data' },
    ],
  },
  {
    name: 'MIS User Management',
    description: 'Manage MIS users',
    permissions: [
      { key: 'mis_users.view', name: 'View MIS Users', description: 'Can view MIS users' },
      { key: 'mis_users.create', name: 'Create MIS Users', description: 'Can create MIS users' },
      { key: 'mis_users.edit', name: 'Edit MIS Users', description: 'Can edit MIS users' },
      { key: 'mis_users.delete', name: 'Delete MIS Users', description: 'Can delete MIS users' },
      { key: 'mis_users.assign_role', name: 'Assign MIS Roles', description: 'Can assign roles to MIS users' },
    ],
  },
  {
    name: 'MIS Role Management',
    description: 'Manage MIS roles',
    permissions: [
      { key: 'mis_roles.view', name: 'View MIS Roles', description: 'Can view MIS roles' },
      { key: 'mis_roles.create', name: 'Create MIS Roles', description: 'Can create MIS roles' },
      { key: 'mis_roles.edit', name: 'Edit MIS Roles', description: 'Can edit MIS roles' },
      { key: 'mis_roles.delete', name: 'Delete MIS Roles', description: 'Can delete MIS roles' },
    ],
  },
]

const MISSettings = ({ initialTab = 'roles' }) => {
  const { user, isAdmin, canManageMISSettings, canViewMISRoles, canManageMISRoles, canViewMISUsers, canManageMISUsers } = useAuth()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Role editing
  const [editingRole, setEditingRole] = useState(null)
  const [newRole, setNewRole] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [],
  })
  const [showNewRoleForm, setShowNewRoleForm] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState({})

  useEffect(() => {
    fetchRoles()
    fetchUsers()
  }, [])

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Filter to show MIS-related roles
      const allRoles = response.data.roles || []
      const misRoles = allRoles.filter(r => 
        r.name.includes('MIS') || 
        r.name === 'SITE_ENGINEER' || 
        r.name === 'ADMIN' ||
        r.permissions?.some(p => p.startsWith('mis.') || p.startsWith('meters.'))
      )
      setRoles(misRoles)
    } catch (error) {
      console.error('Error fetching roles:', error)
      toast.error('Error loading roles')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // Filter users with MIS access
      const allUsers = response.data.users || []
      const misUsers = allUsers.filter(u => {
        const userPermissions = u.permissions || []
        const userRole = u.role || u.roleName || ''
        return userRole.includes('MIS') || 
               userRole === 'SITE_ENGINEER' || 
               userRole === 'ADMIN' ||
               userPermissions.some(p => p.startsWith('mis.') || p.startsWith('meters.'))
      })
      setUsers(misUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }))
  }

  const handlePermissionToggle = (permKey, isNewRole = false) => {
    if (isNewRole) {
      setNewRole(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permKey)
          ? prev.permissions.filter(p => p !== permKey)
          : [...prev.permissions, permKey]
      }))
    } else if (editingRole) {
      const currentPerms = editingRole.permissions || []
      setEditingRole(prev => ({
        ...prev,
        permissions: currentPerms.includes(permKey)
          ? currentPerms.filter(p => p !== permKey)
          : [...currentPerms, permKey]
      }))
    }
  }

  const handleSaveRole = async (roleData, isNew = false) => {
    try {
      setSaving(true)
      const token = localStorage.getItem('token')
      
      if (isNew) {
        await axios.post(`${API_URL}/roles`, {
          ...roleData,
          name: roleData.name.toUpperCase().replace(/\s+/g, '_'),
        }, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Role created successfully')
        setShowNewRoleForm(false)
        setNewRole({ name: '', displayName: '', description: '', permissions: [] })
      } else {
        await axios.put(`${API_URL}/roles/${roleData.id}`, roleData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success('Role updated successfully')
        setEditingRole(null)
      }
      
      fetchRoles()
    } catch (error) {
      console.error('Error saving role:', error)
      toast.error(error.response?.data?.message || 'Error saving role')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${API_URL}/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('Role deleted')
      fetchRoles()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting role')
    }
  }

  const handleUserRoleChange = async (userId, roleId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.patch(`${API_URL}/users/${userId}/role`, { roleId }, {
        headers: { Authorization: `Bearer ${token}` },
      })
      toast.success('User role updated')
      fetchUsers()
    } catch (error) {
      toast.error('Error updating user role')
    }
  }

  const PermissionCheckbox = ({ perm, isChecked, onChange, disabled }) => (
    <label className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
      isChecked 
        ? 'bg-purple-50 border-purple-300' 
        : 'bg-white border-gray-200 hover:border-purple-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
      />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{perm.name}</p>
        <p className="text-xs text-gray-500">{perm.description}</p>
      </div>
    </label>
  )

  const RoleCard = ({ role }) => {
    const isEditing = editingRole?.id === role.id
    const permissions = typeof role.permissions === 'string' 
      ? JSON.parse(role.permissions) 
      : (role.permissions || [])
    
    return (
      <div className={`bg-white rounded-xl border ${isEditing ? 'border-purple-400 shadow-lg' : 'border-gray-200'} overflow-hidden`}>
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                role.isSystem ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <Shield className={`w-5 h-5 ${role.isSystem ? 'text-blue-600' : 'text-purple-600'}`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{role.displayName}</h3>
                <p className="text-xs text-gray-500">{role.name}</p>
              </div>
            </div>
            {!role.isSystem && canManageMISRoles() && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingRole(isEditing ? null : { ...role, permissions })}
                  className={`p-2 rounded-lg transition-colors ${
                    isEditing ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-gray-500'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRole(role.id)}
                  className="p-2 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
            {role.isSystem && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">System</span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">{role.description}</p>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editingRole.displayName}
                  onChange={(e) => setEditingRole(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingRole.description}
                  onChange={(e) => setEditingRole(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={2}
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                <div className="space-y-3">
                  {misPermissionCategories.map((category) => (
                    <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleCategory(category.name)}
                        className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100"
                      >
                        <span className="font-medium text-gray-700">{category.name}</span>
                        {expandedCategories[category.name] ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      {expandedCategories[category.name] && (
                        <div className="p-3 grid gap-2">
                          {category.permissions.map((perm) => (
                            <PermissionCheckbox
                              key={perm.key}
                              perm={perm}
                              isChecked={editingRole.permissions.includes(perm.key)}
                              onChange={() => handlePermissionToggle(perm.key)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveRole(editingRole)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1">
              {permissions.slice(0, 5).map((perm) => (
                <span key={perm} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {perm.split('.')[1]}
                </span>
              ))}
              {permissions.length > 5 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
                  +{permissions.length - 5} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MIS Settings</h1>
          <p className="text-gray-500 mt-1">Manage MIS roles, permissions, and user access</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'roles'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="w-4 h-4 inline-block mr-2" />
          Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          MIS Users
        </button>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Create New Role */}
          {canManageMISRoles() && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowNewRoleForm(!showNewRoleForm)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                Create MIS Role
              </button>
            </div>
          )}

          {/* New Role Form */}
          {showNewRoleForm && (
            <div className="bg-white rounded-xl border border-purple-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New MIS Role</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                    <input
                      type="text"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., MIS_SUPERVISOR"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={newRole.displayName}
                      onChange={(e) => setNewRole(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="e.g., MIS Supervisor"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this role's responsibilities..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    rows={2}
                  />
                </div>

                {/* Permissions for new role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Permissions</label>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {misPermissionCategories.map((category) => (
                      <div key={category.name} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleCategory(`new_${category.name}`)}
                          className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100"
                        >
                          <span className="font-medium text-gray-700">{category.name}</span>
                          {expandedCategories[`new_${category.name}`] ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        {expandedCategories[`new_${category.name}`] && (
                          <div className="p-3 grid gap-2">
                            {category.permissions.map((perm) => (
                              <PermissionCheckbox
                                key={perm.key}
                                perm={perm}
                                isChecked={newRole.permissions.includes(perm.key)}
                                onChange={() => handlePermissionToggle(perm.key, true)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowNewRoleForm(false)
                      setNewRole({ name: '', displayName: '', description: '', permissions: [] })
                    }}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSaveRole(newRole, true)}
                    disabled={saving || !newRole.name || !newRole.displayName}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create Role
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Roles List */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">MIS Users</h3>
            <p className="text-sm text-gray-500">Users with MIS access</p>
          </div>
          
          {users.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {users.map((u) => (
                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-medium">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{u.firstName} {u.lastName}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      u.role === 'ADMIN' || u.role === 'MIS_ADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : u.role === 'MIS_VERIFIER'
                        ? 'bg-green-100 text-green-700'
                        : u.role === 'SITE_ENGINEER'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {u.roleName || u.role?.replace('_', ' ')}
                    </span>
                    {canManageMISUsers() && (
                      <select
                        value={u.roleId || ''}
                        onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                        className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.displayName}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No MIS users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MISSettings
