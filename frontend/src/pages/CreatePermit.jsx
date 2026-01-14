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
  MapPin,
  HardHat,
  User,
  Upload,
  Trash2,
  Image,
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

// Building locations
const buildingLocations = [
  { id: 'reliable_plaza', name: 'Reliable Plaza' },
  { id: 'liberty_tower', name: 'Liberty Tower' },
  { id: 'reliable_tech_park', name: 'Reliable Tech Park' },
  { id: 'empire_tower', name: 'Empire Tower' },
]

// Mandatory PPE items (must be checked)
const mandatoryPPE = [
  'Fire Extinguisher',
  'Safety Belts',
  'Safety Shoes',
  'Safety Helmets',
  'Electrical Isolation',
]

// Optional PPE items (can be checked/unchecked)
const optionalPPE = [
  'Gloves',
  'Ear Plugs',
  'Dust Masks',
  'Face Shields',
  'Locks & Tags',
  'Safety Goggles',
  'Area Barricading',
  'Reflective Jackets',
  'Warning Signages',
  'Flashback Arrestors',
  'Scaffolds & Ladders',
]

// ID Proof types
const idProofTypes = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'driving_license', label: 'Driving License' },
  { value: 'voter_id', label: 'Voter ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'other', label: 'Other ID' },
]

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
    buildingLocation: '',
    exactLocation: '',
    location: '',
    workType: preSelectedType || '',
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '18:00',
    priority: 'MEDIUM',
    hazards: [],
    precautions: [],
    equipment: [],
    contractorName: '',
    contractorPhone: '',
    companyName: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })
  
  // Vendor Details
  const [vendorDetails, setVendorDetails] = useState({
    vendorName: '',
    vendorPhone: '',
    vendorCompany: '',
    vendorEmail: '',
  })
  
  // Workers List
  const [workers, setWorkers] = useState([])
  const [newWorker, setNewWorker] = useState({
    name: '',
    phone: '',
    idProofType: 'aadhaar',
    idProofNumber: '',
    idProofImage: null,
    idProofPreview: null,
  })
  
  // PPE State
  const [selectedPPE, setSelectedPPE] = useState(() => {
    const initial = {}
    mandatoryPPE.forEach(item => { initial[item] = false })
    optionalPPE.forEach(item => { initial[item] = false })
    return initial
  })
  const [otherPPE, setOtherPPE] = useState('')
  const [otherPPEList, setOtherPPEList] = useState([])
  
  const [newHazard, setNewHazard] = useState('')
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
      
      let buildingLocation = ''
      let exactLocation = permit.location || ''
      
      for (const building of buildingLocations) {
        if (permit.location?.includes(building.name)) {
          buildingLocation = building.id
          exactLocation = permit.location.replace(building.name, '').replace(' - ', '').trim()
          break
        }
      }
      
      // Parse date and time from ISO datetime
      const startDateTime = new Date(permit.startDate)
      const endDateTime = new Date(permit.endDate)
      
      setFormData({
        title: permit.title,
        description: permit.description,
        buildingLocation: buildingLocation,
        exactLocation: exactLocation,
        location: permit.location,
        workType: permit.workType,
        startDate: permit.startDate.split('T')[0],
        startTime: startDateTime.toTimeString().slice(0, 5) || '08:00',
        endDate: permit.endDate.split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5) || '18:00',
        priority: permit.priority,
        hazards: permit.hazards || [],
        precautions: permit.precautions || [],
        equipment: permit.equipment || [],
        contractorName: permit.contractorName || '',
        contractorPhone: permit.contractorPhone || '',
        companyName: permit.companyName || '',
      })
      
      // Load vendor details if available
      if (permit.vendorDetails) {
        setVendorDetails(permit.vendorDetails)
      }
      
      // Load workers if available
      if (permit.workers && permit.workers.length > 0) {
        setWorkers(permit.workers)
      }
      
      // Parse equipment for PPE
      if (permit.equipment && permit.equipment.length > 0) {
        const newSelectedPPE = { ...selectedPPE }
        const others = []
        
        permit.equipment.forEach(item => {
          if (mandatoryPPE.includes(item) || optionalPPE.includes(item)) {
            newSelectedPPE[item] = true
          } else {
            others.push(item)
          }
        })
        
        setSelectedPPE(newSelectedPPE)
        setOtherPPEList(others)
      }
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

  const handleVendorChange = (e) => {
    const { name, value } = e.target
    setVendorDetails({ ...vendorDetails, [name]: value })
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const handleNewWorkerChange = (e) => {
    const { name, value } = e.target
    setNewWorker({ ...newWorker, [name]: value })
  }

  const handleWorkerImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setNewWorker({
          ...newWorker,
          idProofImage: file,
          idProofPreview: reader.result,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const addWorker = () => {
    if (!newWorker.name.trim()) {
      toast.error('Worker name is required')
      return
    }
    if (!newWorker.idProofNumber.trim()) {
      toast.error('ID proof number is required')
      return
    }
    
    const workerToAdd = {
      id: Date.now(),
      name: newWorker.name.trim(),
      phone: newWorker.phone.trim(),
      idProofType: newWorker.idProofType,
      idProofNumber: newWorker.idProofNumber.trim(),
      idProofImage: newWorker.idProofPreview, // Store base64 for now
    }
    
    setWorkers([...workers, workerToAdd])
    setNewWorker({
      name: '',
      phone: '',
      idProofType: 'aadhaar',
      idProofNumber: '',
      idProofImage: null,
      idProofPreview: null,
    })
    toast.success('Worker added successfully')
  }

  const removeWorker = (workerId) => {
    setWorkers(workers.filter(w => w.id !== workerId))
    toast.success('Worker removed')
  }

  const handlePPEChange = (item) => {
    setSelectedPPE(prev => ({
      ...prev,
      [item]: !prev[item]
    }))
    if (errors.mandatoryPPE && mandatoryPPE.includes(item)) {
      setErrors(prev => ({ ...prev, mandatoryPPE: null }))
    }
  }

  const addOtherPPE = () => {
    if (otherPPE.trim() && !otherPPEList.includes(otherPPE.trim())) {
      setOtherPPEList([...otherPPEList, otherPPE.trim()])
      setOtherPPE('')
    }
  }

  const removeOtherPPE = (item) => {
    setOtherPPEList(otherPPEList.filter(p => p !== item))
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
    if (!formData.buildingLocation) newErrors.buildingLocation = 'Building location is required'
    if (!formData.exactLocation.trim()) newErrors.exactLocation = 'Exact working area is required'
    if (!formData.workType) newErrors.workType = 'Work type is required'
    if (!formData.startDate) newErrors.startDate = 'Start date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endDate) newErrors.endDate = 'End date is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    
    // Validate end datetime is after start datetime
    if (formData.startDate && formData.endDate && formData.startTime && formData.endTime) {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)
      if (endDateTime <= startDateTime) {
        newErrors.endDate = 'End date/time must be after start date/time'
      }
    }
    
    // Vendor validation
    if (!vendorDetails.vendorName.trim()) newErrors.vendorName = 'Vendor name is required'
    if (!vendorDetails.vendorPhone.trim()) newErrors.vendorPhone = 'Vendor phone is required'
    
    // Workers validation
    if (workers.length === 0) newErrors.workers = 'At least one worker is required'
    
    // Check if all mandatory PPE items are checked
    const uncheckedMandatory = mandatoryPPE.filter(item => !selectedPPE[item])
    if (uncheckedMandatory.length > 0) {
      newErrors.mandatoryPPE = `Please confirm all mandatory PPE items: ${uncheckedMandatory.join(', ')}`
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) {
      toast.error('Please fill all required fields')
      return
    }

    const building = buildingLocations.find(b => b.id === formData.buildingLocation)
    const combinedLocation = `${building?.name || ''} - ${formData.exactLocation}`

    const allEquipment = [
      ...Object.entries(selectedPPE).filter(([_, selected]) => selected).map(([item]) => item),
      ...otherPPEList
    ]

    // Combine date and time into ISO datetime strings
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`).toISOString()
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`).toISOString()

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        startDate: startDateTime,
        endDate: endDateTime,
        location: combinedLocation,
        equipment: allEquipment,
        vendorDetails: vendorDetails,
        workers: workers,
        contractorName: vendorDetails.vendorName,
        contractorPhone: vendorDetails.vendorPhone,
        companyName: vendorDetails.vendorCompany,
      }

      if (isEdit) {
        await permitsAPI.update(id, submitData)
        toast.success('Permit updated successfully')
      } else {
        await permitsAPI.create(submitData)
        toast.success('Permit created successfully')
      }
      navigate('/permits')
    } catch (error) {
      toast.error(error.response?.data?.message || `Error ${isEdit ? 'updating' : 'creating'} permit`)
    } finally {
      setLoading(false)
    }
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

            {/* Start Date & Time */}
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
                <label className="label">Start Time *</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className={`input ${errors.startTime ? 'input-error' : ''}`}
                />
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
              </div>
            </div>

            {/* End Date & Time */}
            <div className="grid md:grid-cols-2 gap-4">
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
              <div>
                <label className="label">End Time *</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className={`input ${errors.endTime ? 'input-error' : ''}`}
                />
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>
            
            <p className="text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
              <span className="font-medium text-blue-700">Note:</span> The permit will automatically close at the specified end date and time. 
              Safety officer remarks are required before closure.
            </p>
          </div>
        </div>

        {/* Work Location */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Work Location *</h2>
          </div>
          <div className="card-body space-y-4">
            <div>
              <label className="label text-amber-700">(To be filled by the applicant/Name of the building)</label>
              <div className="space-y-2 mt-2">
                {buildingLocations.map((building) => (
                  <label
                    key={building.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.buildingLocation === building.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="buildingLocation"
                      value={building.id}
                      checked={formData.buildingLocation === building.id}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">{building.name}</span>
                  </label>
                ))}
              </div>
              {errors.buildingLocation && <p className="text-red-500 text-sm mt-1">{errors.buildingLocation}</p>}
            </div>

            <div>
              <label className="label text-amber-700">(To be filled by the applicant/Exact working area)</label>
              <input
                type="text"
                name="exactLocation"
                value={formData.exactLocation}
                onChange={handleChange}
                className={`input mt-2 ${errors.exactLocation ? 'input-error' : ''}`}
                placeholder="Your answer"
              />
              {errors.exactLocation && <p className="text-red-500 text-sm mt-1">{errors.exactLocation}</p>}
            </div>
          </div>
        </div>

        {/* Vendor Details */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Vendor Details *</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Vendor/Contractor Name *</label>
                <input
                  type="text"
                  name="vendorName"
                  value={vendorDetails.vendorName}
                  onChange={handleVendorChange}
                  className={`input ${errors.vendorName ? 'input-error' : ''}`}
                  placeholder="Enter vendor name"
                />
                {errors.vendorName && <p className="text-red-500 text-sm mt-1">{errors.vendorName}</p>}
              </div>
              <div>
                <label className="label">Vendor Phone Number *</label>
                <input
                  type="tel"
                  name="vendorPhone"
                  value={vendorDetails.vendorPhone}
                  onChange={handleVendorChange}
                  className={`input ${errors.vendorPhone ? 'input-error' : ''}`}
                  placeholder="Enter phone number"
                />
                {errors.vendorPhone && <p className="text-red-500 text-sm mt-1">{errors.vendorPhone}</p>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  name="vendorCompany"
                  value={vendorDetails.vendorCompany}
                  onChange={handleVendorChange}
                  className="input"
                  placeholder="Enter company name"
                />
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  name="vendorEmail"
                  value={vendorDetails.vendorEmail}
                  onChange={handleVendorChange}
                  className="input"
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workers Details */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900">Workers Details *</h2>
          </div>
          <div className="card-body space-y-4">
            {/* Add Worker Form */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-gray-700">Add Worker</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Worker Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newWorker.name}
                    onChange={handleNewWorkerChange}
                    className="input"
                    placeholder="Enter worker name"
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newWorker.phone}
                    onChange={handleNewWorkerChange}
                    className="input"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">ID Proof Type *</label>
                  <select
                    name="idProofType"
                    value={newWorker.idProofType}
                    onChange={handleNewWorkerChange}
                    className="input"
                  >
                    {idProofTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">ID Proof Number *</label>
                  <input
                    type="text"
                    name="idProofNumber"
                    value={newWorker.idProofNumber}
                    onChange={handleNewWorkerChange}
                    className="input"
                    placeholder="Enter ID number"
                  />
                </div>
              </div>
              
              {/* ID Proof Image Upload */}
              <div>
                <label className="label">Upload ID Proof Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500">Click to upload Aadhaar/PAN/ID image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWorkerImageUpload}
                      className="hidden"
                    />
                  </label>
                  {newWorker.idProofPreview && (
                    <div className="relative w-24 h-24 border rounded-lg overflow-hidden">
                      <img
                        src={newWorker.idProofPreview}
                        alt="ID Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setNewWorker({ ...newWorker, idProofImage: null, idProofPreview: null })}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Accepted formats: JPG, PNG, GIF (Max 5MB)</p>
              </div>
              
              <button
                type="button"
                onClick={addWorker}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Worker
              </button>
            </div>
            
            {/* Workers List */}
            {workers.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700">Added Workers ({workers.length})</h3>
                {workers.map((worker, index) => (
                  <div
                    key={worker.id}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    {/* Worker Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {worker.idProofImage ? (
                        <img
                          src={worker.idProofImage}
                          alt={`${worker.name}'s ID`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Worker Info */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{worker.name}</p>
                      <p className="text-sm text-gray-500">
                        {idProofTypes.find(t => t.value === worker.idProofType)?.label}: {worker.idProofNumber}
                      </p>
                      {worker.phone && (
                        <p className="text-sm text-gray-500">Phone: {worker.phone}</p>
                      )}
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() => removeWorker(worker.id)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {errors.workers && <p className="text-red-500 text-sm">{errors.workers}</p>}
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

        {/* Safety Precautions (Combined with PPE & Tools) */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-gray-900">Safety Precautions - List of Mandatory PPE & Tools</h2>
          </div>
          <div className="card-body space-y-4">
            {/* Instructions */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>1. <span className="text-amber-700">(To be filled by the applicant/Tick the applicable items)</span></p>
              <p>2. <strong>These below listed PPE items are unavoidable (must be checked)</strong></p>
            </div>

            {/* Mandatory Items (Must be checked) */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mandatoryPPE.map((item) => (
                  <label
                    key={item}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPPE[item]
                        ? 'border-amber-500 bg-amber-100'
                        : 'border-amber-300 bg-white hover:border-amber-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPPE[item]}
                      onChange={() => handlePPEChange(item)}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="text-gray-800 font-medium">{item} <span className="text-red-500">*</span></span>
                  </label>
                ))}
              </div>
              {errors.mandatoryPPE && <p className="text-red-500 text-sm mt-2">{errors.mandatoryPPE}</p>}
            </div>

            {/* Optional PPE Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {optionalPPE.map((item) => (
                <label
                  key={item}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPPE[item]
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPPE[item]}
                    onChange={() => handlePPEChange(item)}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-gray-700">{item}</span>
                </label>
              ))}
            </div>

            {/* Other PPE Input */}
            <div>
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={otherPPEList.length > 0}
                  readOnly
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="text-gray-700">Other:</span>
                <input
                  type="text"
                  value={otherPPE}
                  onChange={(e) => setOtherPPE(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOtherPPE())}
                  className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none px-2 py-1"
                  placeholder="Enter other PPE/Tool"
                />
                <button
                  type="button"
                  onClick={addOtherPPE}
                  className="btn btn-secondary btn-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </label>
              
              {/* Other PPE List */}
              {otherPPEList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {otherPPEList.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => removeOtherPPE(item)}
                        className="hover:text-purple-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
