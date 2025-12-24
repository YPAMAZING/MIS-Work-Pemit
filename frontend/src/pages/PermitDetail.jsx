import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { permitsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  User,
  Building,
  AlertTriangle,
  Shield,
  FileText,
  Edit,
  Trash2,
  Flame,
  Zap,
  ArrowUp,
  Box,
} from 'lucide-react'
import { format } from 'date-fns'

const PermitDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [permit, setPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState(false)

  useEffect(() => {
    fetchPermit()
  }, [id])

  const fetchPermit = async () => {
    try {
      const response = await permitsAPI.getById(id)
      setPermit(response.data.permit)
    } catch (error) {
      toast.error('Error fetching permit details')
      navigate('/permits')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await permitsAPI.delete(id)
      toast.success('Permit deleted successfully')
      navigate('/permits')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting permit')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-amber-100', text: 'text-amber-800', icon: <Clock className="w-4 h-4" /> },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: <XCircle className="w-4 h-4" /> },
    }
    return badges[status] || badges.PENDING
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      LOW: { bg: 'bg-gray-100', text: 'text-gray-700' },
      MEDIUM: { bg: 'bg-blue-100', text: 'text-blue-700' },
      HIGH: { bg: 'bg-orange-100', text: 'text-orange-700' },
      CRITICAL: { bg: 'bg-red-100', text: 'text-red-700' },
    }
    return badges[priority] || badges.MEDIUM
  }

  const getWorkTypeInfo = (type) => {
    const types = {
      HOT_WORK: { label: 'Hot Work', icon: <Flame className="w-5 h-5" />, color: 'text-red-500' },
      CONFINED_SPACE: { label: 'Confined Space Entry', icon: <Box className="w-5 h-5" />, color: 'text-orange-500' },
      ELECTRICAL: { label: 'Electrical Work', icon: <Zap className="w-5 h-5" />, color: 'text-yellow-500' },
      WORKING_AT_HEIGHT: { label: 'Working at Height', icon: <ArrowUp className="w-5 h-5" />, color: 'text-blue-500' },
      EXCAVATION: { label: 'Excavation', icon: <FileText className="w-5 h-5" />, color: 'text-purple-500' },
      LIFTING: { label: 'Lifting Operations', icon: <FileText className="w-5 h-5" />, color: 'text-cyan-500' },
      CHEMICAL: { label: 'Chemical Handling', icon: <FileText className="w-5 h-5" />, color: 'text-emerald-500' },
      RADIATION: { label: 'Radiation Work', icon: <FileText className="w-5 h-5" />, color: 'text-amber-500' },
      GENERAL: { label: 'General Work', icon: <FileText className="w-5 h-5" />, color: 'text-gray-500' },
    }
    return types[type] || types.GENERAL
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!permit) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-lg text-gray-500">Permit not found</p>
        <Link to="/permits" className="btn btn-primary mt-4">
          Back to Permits
        </Link>
      </div>
    )
  }

  const statusBadge = getStatusBadge(permit.status)
  const priorityBadge = getPriorityBadge(permit.priority)
  const workTypeInfo = getWorkTypeInfo(permit.workType)
  const canEdit = permit.status === 'PENDING' && (permit.createdBy === user.id || user.role === 'ADMIN')
  const canDelete = permit.status === 'PENDING' && (permit.createdBy === user.id || user.role === 'ADMIN')
  const approval = permit.approvals?.[0]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/permits')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Permits
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{permit.title}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className={`badge ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.icon}
              <span className="ml-1">{permit.status}</span>
            </span>
            <span className={`badge ${priorityBadge.bg} ${priorityBadge.text}`}>
              {permit.priority} Priority
            </span>
            <div className={`flex items-center gap-1 ${workTypeInfo.color}`}>
              {workTypeInfo.icon}
              <span className="text-sm font-medium">{workTypeInfo.label}</span>
            </div>
          </div>
        </div>
        {(canEdit || canDelete) && (
          <div className="flex gap-2">
            {canEdit && (
              <Link to={`/permits/${id}/edit`} className="btn btn-secondary">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Link>
            )}
            {canDelete && (
              <button onClick={() => setDeleteModal(true)} className="btn btn-danger">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            </div>
            <div className="card-body">
              <p className="text-gray-600 whitespace-pre-wrap">{permit.description}</p>
            </div>
          </div>

          {/* Hazards & Precautions */}
          <div className="grid md:grid-cols-2 gap-6">
            {permit.hazards?.length > 0 && (
              <div className="card">
                <div className="card-header flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Hazards Identified</h2>
                </div>
                <div className="card-body">
                  <ul className="space-y-2">
                    {permit.hazards.map((hazard, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 mt-2 bg-red-500 rounded-full" />
                        <span className="text-gray-600">{hazard}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {permit.precautions?.length > 0 && (
              <div className="card">
                <div className="card-header flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Safety Precautions</h2>
                </div>
                <div className="card-body">
                  <ul className="space-y-2">
                    {permit.precautions.map((precaution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        <span className="text-gray-600">{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Equipment */}
          {permit.equipment?.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Required Equipment</h2>
              </div>
              <div className="card-body">
                <div className="flex flex-wrap gap-2">
                  {permit.equipment.map((item, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Approval Information */}
          {approval && (
            <div className="card">
              <div className="card-header">
                <h2 className="text-lg font-semibold text-gray-900">Approval Information</h2>
              </div>
              <div className="card-body">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    approval.decision === 'APPROVED' ? 'bg-green-100' :
                    approval.decision === 'REJECTED' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    {approval.decision === 'APPROVED' ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : approval.decision === 'REJECTED' ? (
                      <XCircle className="w-6 h-6 text-red-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {approval.decision === 'PENDING' ? 'Awaiting Approval' : `${approval.decision} by ${approval.approverName || 'Safety Officer'}`}
                    </p>
                    {approval.approvedAt && (
                      <p className="text-sm text-gray-500">
                        {format(new Date(approval.approvedAt), 'MMMM dd, yyyy at hh:mm a')}
                      </p>
                    )}
                    {approval.comment && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">{approval.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium text-gray-900">{permit.location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Work Period</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(permit.startDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600">
                    to {format(new Date(permit.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(permit.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requestor */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Requestor</h2>
            </div>
            <div className="card-body">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-white">
                    {permit.user?.firstName?.[0]}{permit.user?.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {permit.user?.firstName} {permit.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{permit.user?.email}</p>
                </div>
              </div>
              {permit.user?.department && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  {permit.user.department}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Permit</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete this permit? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleDelete} className="btn btn-danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PermitDetail
