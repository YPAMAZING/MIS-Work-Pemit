import { useState, useEffect } from 'react'
import { usersAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Users as UsersIcon,
  Shield,
  User,
  Mail,
  Building,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  UserPlus,
  HardHat,
  ClipboardCheck,
  Wrench,
  Phone,
  Calendar,
  UserCheck,
  Bell,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

const Users = () => {
  const [users, setUsers] = useState([])
  const [pendingUsers, setPendingUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [modal, setModal] = useState({ open: false, type: null, user: null })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'REQUESTOR',
    department: '',
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('approved')
  const [rejectReason, setRejectReason] = useState('')
  const [userStats, setUserStats] = useState(null)

  useEffect(() => {
    fetchPendingUsers()
    fetchUserStats()
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [filters])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await usersAPI.getAll({
        page: filters.page,
        limit: 10,
        search: filters.search,
        role: filters.role,
        status: 'approved',
      })
      setUsers(response.data.users)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Error fetching users')
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingUsers = async () => {
    setPendingLoading(true)
    try {
      const response = await usersAPI.getPending()
      setPendingUsers(response.data.users)
    } catch (error) {
      console.error('Error fetching pending users:', error)
    } finally {
      setPendingLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await usersAPI.getStats()
      setUserStats(response.data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  const handleApproveUser = async (userId) => {
    try {
      await usersAPI.approve(userId)
      toast.success('User approved successfully!')
      fetchPendingUsers()
      fetchUsers()
      fetchUserStats()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error approving user')
    }
  }

  const handleRejectUser = async (userId) => {
    try {
      await usersAPI.reject(userId, rejectReason)
      toast.success('User registration rejected')
      setRejectReason('')
      closeModal()
      fetchPendingUsers()
      fetchUserStats()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rejecting user')
    }
  }

  const openCreateModal = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'REQUESTOR',
      department: '',
      phone: '',
    })
    setModal({ open: true, type: 'create', user: null })
  }

  const openEditModal = (user) => {
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name || user.role || 'REQUESTOR',
      department: user.department || '',
      phone: user.phone || '',
      isActive: user.isActive,
    })
    setModal({ open: true, type: 'edit', user })
  }

  const openDeleteModal = (user) => {
    setModal({ open: true, type: 'delete', user })
  }

  const openRejectModal = (user) => {
    setRejectReason('')
    setModal({ open: true, type: 'reject', user })
  }

  const closeModal = () => {
    setModal({ open: false, type: null, user: null })
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'REQUESTOR',
      department: '',
      phone: '',
    })
    setShowPassword(false)
    setRejectReason('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (modal.type === 'create') {
        await usersAPI.create(formData)
        toast.success('User created successfully')
      } else if (modal.type === 'edit') {
        const updateData = { ...formData }
        if (!updateData.password) delete updateData.password
        await usersAPI.update(modal.user.id, updateData)
        toast.success('User updated successfully')
      }
      fetchUsers()
      fetchUserStats()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving user')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!modal.user) return

    setSubmitting(true)
    try {
      await usersAPI.delete(modal.user.id)
      toast.success('User deactivated successfully')
      fetchUsers()
      fetchUserStats()
      closeModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deactivating user')
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleBadge = (roleName) => {
    const role = typeof roleName === 'object' ? roleName?.name : roleName
    const badges = {
      ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin', icon: Shield },
      SAFETY_OFFICER: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Safety Officer', icon: HardHat },
      REQUESTOR: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Requestor', icon: ClipboardCheck },
      SITE_ENGINEER: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Site Engineer', icon: Wrench },
    }
    return badges[role] || badges.REQUESTOR
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="col-span-1 md:col-span-2">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage users, roles, and registration approvals</p>
        </div>
        
        {/* Stats Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{userStats?.activeUsers || 0}</p>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pendingUsers.length > 0 ? 'bg-amber-100' : 'bg-gray-100'}`}>
              <Clock className={`w-5 h-5 ${pendingUsers.length > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
              <p className="text-sm text-gray-500">Pending Approval</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Alert */}
      {pendingUsers.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">
                {pendingUsers.length} Registration{pendingUsers.length !== 1 ? 's' : ''} Awaiting Approval
              </h3>
              <p className="text-sm text-amber-700 mt-0.5">
                New users have registered and are waiting for admin approval to access the system.
              </p>
            </div>
            <button 
              onClick={() => setActiveTab('pending')}
              className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              Review Now
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'approved' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Approved Users
          </div>
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
            activeTab === 'pending' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending Approvals
            {pendingUsers.length > 0 && (
              <span className="w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {pendingUsers.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Pending Users Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingLoading ? (
            <div className="card flex items-center justify-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700">No Pending Registrations</p>
              <p className="text-sm text-gray-500 mt-1">All user registrations have been processed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingUsers.map((user) => {
                const roleBadge = getRoleBadge(user.requestedRole)
                const RoleIcon = roleBadge.icon
                return (
                  <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-100">
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge.bg} ${roleBadge.text}`}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleBadge.label}
                        </span>
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    {/* Body */}
                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1e3a6e] to-[#2a4a80] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-semibold text-white">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {user.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.department && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span>{user.department}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Registered {format(new Date(user.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex border-t border-gray-100">
                      <button
                        onClick={() => openRejectModal(user)}
                        className="flex-1 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                      <div className="w-px bg-gray-100" />
                      <button
                        onClick={() => handleApproveUser(user.id)}
                        className="flex-1 px-4 py-3 text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Approved Users Tab */}
      {activeTab === 'approved' && (
        <>
          {/* Search and Filters */}
          <div className="card p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="input pl-11"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </button>
              <button onClick={openCreateModal} className="btn btn-primary">
                <Plus className="w-5 h-5 mr-2" />
                Add User
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 animate-slide-up">
                <div>
                  <label className="label">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
                    className="input"
                  >
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="SITE_ENGINEER">Site Engineer</option>
                    <option value="REQUESTOR">Requestor</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setFilters({ search: '', role: '', page: 1 })}
                    className="btn btn-secondary"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <UsersIcon className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-lg font-medium">No users found</p>
                <button onClick={openCreateModal} className="btn btn-primary mt-4">
                  <Plus className="w-5 h-5 mr-2" />
                  Add User
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permits</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => {
                      const roleBadge = getRoleBadge(user.role?.name || user.role)
                      const RoleIcon = roleBadge.icon
                      return (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a6e] to-[#2a4a80] rounded-full flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                  {user.firstName?.[0]}{user.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Joined {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Mail className="w-3.5 h-3.5" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <Phone className="w-3.5 h-3.5" />
                                  {user.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${roleBadge.bg} ${roleBadge.text}`}>
                              <RoleIcon className="w-3.5 h-3.5" />
                              {roleBadge.label}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {user.department ? (
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Building className="w-4 h-4 text-gray-400" />
                                {user.department}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600">{user._count?.permitRequests || 0}</span>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => openEditModal(user)}
                                className="p-2 text-gray-500 hover:text-[#1e3a6e] hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(user)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Deactivate"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={filters.page === 1}
                    className="btn btn-secondary py-1.5 px-3 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={filters.page === pagination.totalPages}
                    className="btn btn-secondary py-1.5 px-3 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {modal.open && (modal.type === 'create' || modal.type === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${modal.type === 'create' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                  {modal.type === 'create' ? (
                    <UserPlus className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Edit className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modal.type === 'create' ? 'Add New User' : 'Edit User'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {modal.type === 'create' ? 'Create a new user account' : 'Update user details'}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="input pl-10"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="input pl-10"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="label">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input pl-10"
                    placeholder="john@company.com"
                    required
                    disabled={modal.type === 'edit'}
                  />
                </div>
              </div>
              
              <div>
                <label className="label">
                  Password {modal.type === 'create' ? '*' : '(leave blank to keep current)'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input pr-11"
                    placeholder={modal.type === 'create' ? 'Min. 6 characters' : '••••••••'}
                    required={modal.type === 'create'}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="REQUESTOR">Requestor</option>
                    <option value="SAFETY_OFFICER">Safety Officer</option>
                    <option value="SITE_ENGINEER">Site Engineer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="label">Department</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="input pl-10"
                      placeholder="Operations"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input pl-10"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
              
              {modal.type === 'edit' && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-[#1e3a6e] focus:ring-[#1e3a6e]"
                    />
                    <div>
                      <span className="font-medium text-gray-900">User is active</span>
                      <p className="text-sm text-gray-500">Inactive users cannot login</p>
                    </div>
                  </label>
                </div>
              )}
              
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary flex-1">
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : modal.type === 'create' ? 'Create User' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal.open && modal.type === 'delete' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate User</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to deactivate <span className="font-semibold text-gray-700">{modal.user?.firstName} {modal.user?.lastName}</span>? 
                They will no longer be able to access the system.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={closeModal} className="btn btn-secondary px-6" disabled={submitting}>
                  Cancel
                </button>
                <button onClick={handleDelete} className="btn btn-danger px-6" disabled={submitting}>
                  {submitting ? 'Deactivating...' : 'Deactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {modal.open && modal.type === 'reject' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reject Registration</h3>
                  <p className="text-sm text-gray-500">
                    {modal.user?.firstName} {modal.user?.lastName}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="label">Reason for rejection (optional)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="Provide a reason for rejecting this registration..."
                />
              </div>
              
              <div className="flex gap-3">
                <button onClick={closeModal} className="btn btn-secondary flex-1">
                  Cancel
                </button>
                <button 
                  onClick={() => handleRejectUser(modal.user.id)} 
                  className="btn btn-danger flex-1"
                >
                  Reject Registration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
