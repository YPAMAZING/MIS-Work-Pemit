import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { permitsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  AlertTriangle,
  Shield,
  Wrench,
  Flame,
  Zap,
  ArrowUp,
  Box,
  FileText,
  Users,
  Building,
  Phone,
  CheckSquare,
  ClipboardCheck,
} from 'lucide-react'

// Work type labels mapping
const workTypeLabels = {
  'HOT_WORK': 'Hot Work Permit',
  'CONFINED_SPACE': 'Confined Space Permit',
  'ELECTRICAL': 'Electrical Work Permit',
  'WORKING_AT_HEIGHT': 'Work Height Permit',
  'EXCAVATION': 'Excavation Work Permit',
  'LIFTING': 'Lifting Permit',
  'CHEMICAL': 'Chemical Handling Permit',
  'RADIATION': 'Radiation Work Permit',
  'GENERAL': 'General Permit',
  'COLD_WORK': 'Cold Work Permit',
  'LOTO': 'LOTO Permit',
  'VEHICLE': 'Vehicle Work Permit',
  'PRESSURE_TESTING': 'Hydro Pressure Testing',
  'ENERGIZE': 'Energize Permit',
  'SWMS': 'Safe Work Method Statement',
}

const CreatePermit = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const preSelectedType = searchParams.get('type')

  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [workTypes, setWorkTypes] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    workType: preSelectedType || '',
    startDate: '',
    endDate: '',
    priority: 'MEDIUM',
    hazards: [],
    precautions: [],
    equipment: [],
    contractorName: '',
    contractorPhone: '',
    companyName: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  
  // Default measures checklist
  const [measures, setMeasures] = useState([
    { id: 1, question: 'Instruction to Personnel regarding hazards involved and working procedure.', response: null },
    { id: 2, question: 'Are Other Contractors working nearby notified?', response: null },
    { id: 3, question: 'Is there any other work permit is obtained?', response: null },
    { id: 4, question: 'Are escape routes to be provided and kept clear?', response: null },
    { id: 5, question: 'Is combustible material to be removed / covered from and nearby site (up to 5mtr min.)', response: null },
    { id: 6, question: 'Has the area immediately below the work spot been cleared / removed of oil, grease & waste cotton etc...?', response: null },
    { id: 7, question: 'Has gas connection been tested in case there is gas valve / gas line nearby?', response: null },
    { id: 8, question: 'Is fire extinguisher been kept handy at site?', response: null },
    { id: 9, question: 'Has tin sheet / fire retardant cloth/ sheet been placed to contain hot spatters of welding / gas cutting?', response: null },
    { id: 10, question: 'Have all drain inlets been closed?', response: null },
  ])
  const [newHazard, setNewHazard] = useState('')
  const [newPrecaution, setNewPrecaution] = useState('')
  const [newEquipment, setNewEquipment] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchWorkTypes()
    if (isEdit) {
      fetchPermit()
    }
  }, [id])

  const fetchWorkTypes = async () => {
    try {
      const response = await permitsAPI.getWorkTypes()
      setWorkTypes(response.data.workTypes)
    } catch (error) {
      console.error('Error fetching work types:', error)
    }
  }

  const fetchPermit = async () => {
    try {
      const response = await permitsAPI.getById(id)
      const permit = response.data.permit
      setFormData({
        title: permit.title,
        description: permit.description,
        location: permit.location,
        workType: permit.workType,
        startDate: permit.startDate.split('T')[0],
        endDate: permit.endDate.split('T')[0],
        priority: permit.priority,
        hazards: permit.hazards || [],
        precautions: permit.precautions || [],
        equipment: permit.equipment || [],
      })
    } catch (error) {
      toast.error('Error fetching permit')
      navigate('/permits')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const addItem = (type, value, setValue) => {
    if (value.trim()) {
      setFormData({
        ...formData,
        [type]: [...formData[type], value.trim()],
      })
      setValue('')
    }
  }

  const removeItem = (type, index) => {
    setFormData({
      ...formData,
      [type]: formData[type].filter((_, i) => i !== index),
    })
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.workType) newErrors.workType = 'Work type is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      if (isEdit) {
        await permitsAPI.update(id, formData)
        toast.success('Permit updated successfully')
      } else {
        await permitsAPI.create(formData)
        toast.success('Permit created successfully')
      }
      navigate('/permits')
    } catch (error) {
      toast.error(error.response?.data?.message || `Error ${isEdit ? 'updating' : 'creating'} permit`)
    } finally {
      setLoading(false)
    }
  }

  const getWorkTypeIcon = (type) => {
    const icons = {
      HOT_WORK: <Flame className="w-5 h-5" />,
      CONFINED_SPACE: <Box className="w-5 h-5" />,
      ELECTRICAL: <Zap className="w-5 h-5" />,
      WORKING_AT_HEIGHT: <ArrowUp className="w-5 h-5" />,
    }
    return icons[type] || <FileText className="w-5 h-5" />
  }

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/permits')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Permits
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Permit Request' : preSelectedType ? `New ${workTypeLabels[preSelectedType] || 'Permit'} Request` : 'New Permit Request'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isEdit ? 'Update the permit details below' : 'Fill out the form to submit a new permit request'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">Permit Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g., Hot Work Permit - Welding Operation"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className={`input ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe the work to be performed in detail..."
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Work Type *</label>
                <select
                  name="workType"
                  value={formData.workType}
                  onChange={handleChange}
                  className={`input ${errors.workType ? 'input-error' : ''}`}
                >
                  <option value="">Select work type</option>
                  {workTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.workType && <p className="text-red-500 text-sm mt-1">{errors.workType}</p>}
              </div>

              <div>
                <label className="label">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`input ${errors.location ? 'input-error' : ''}`}
                placeholder="e.g., Building A - Boiler Room B2"
              />
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`input ${errors.startDate ? 'input-error' : ''}`}
                />
                {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="label">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`input ${errors.endDate ? 'input-error' : ''}`}
                />
                {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Hazards */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Hazards Identified</h2>
          </div>
          <div className="card-body">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newHazard}
                onChange={(e) => setNewHazard(e.target.value)}
                className="input flex-1"
                placeholder="e.g., Fire, Burns, Toxic fumes"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('hazards', newHazard, setNewHazard))}
              />
              <button
                type="button"
                onClick={() => addItem('hazards', newHazard, setNewHazard)}
                className="btn btn-secondary"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.hazards.map((hazard, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-full text-sm"
                >
                  {hazard}
                  <button
                    type="button"
                    onClick={() => removeItem('hazards', index)}
                    className="hover:text-red-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Precautions */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">Safety Precautions</h2>
          </div>
          <div className="card-body">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newPrecaution}
                onChange={(e) => setNewPrecaution(e.target.value)}
                className="input flex-1"
                placeholder="e.g., Fire extinguisher nearby, PPE required"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('precautions', newPrecaution, setNewPrecaution))}
              />
              <button
                type="button"
                onClick={() => addItem('precautions', newPrecaution, setNewPrecaution)}
                className="btn btn-secondary"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.precautions.map((precaution, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm"
                >
                  {precaution}
                  <button
                    type="button"
                    onClick={() => removeItem('precautions', index)}
                    className="hover:text-green-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Required Equipment</h2>
          </div>
          <div className="card-body">
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.target.value)}
                className="input flex-1"
                placeholder="e.g., Welding helmet, Fire blanket, Safety harness"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('equipment', newEquipment, setNewEquipment))}
              />
              <button
                type="button"
                onClick={() => addItem('equipment', newEquipment, setNewEquipment)}
                className="btn btn-secondary"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.equipment.map((item, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => removeItem('equipment', index)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/permits')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-5 h-5" />
                {isEdit ? 'Update Permit' : 'Submit Request'}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePermit
