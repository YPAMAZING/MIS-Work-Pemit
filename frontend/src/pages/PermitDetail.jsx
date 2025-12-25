import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { permitsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Download,
  QrCode,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Shield,
  Wrench,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Calendar,
  Building,
  Phone,
  Printer,
  Share2,
  Edit,
  Play,
  Pause,
  RotateCcw,
  X,
  Plus,
  FileText,
} from 'lucide-react'

// Work type configurations
const workTypeConfig = {
  'HOT_WORK': { label: 'HOT WORK PERMIT', color: 'orange', abbr: 'HWP' },
  'CONFINED_SPACE': { label: 'CONFINED SPACE PERMIT', color: 'purple', abbr: 'CSP' },
  'ELECTRICAL': { label: 'ELECTRICAL WORK PERMIT', color: 'yellow', abbr: 'EWP' },
  'WORKING_AT_HEIGHT': { label: 'WORK AT HEIGHT PERMIT', color: 'blue', abbr: 'WHP' },
  'EXCAVATION': { label: 'EXCAVATION PERMIT', color: 'amber', abbr: 'EXP' },
  'LIFTING': { label: 'LIFTING PERMIT', color: 'teal', abbr: 'LP' },
  'CHEMICAL': { label: 'CHEMICAL HANDLING PERMIT', color: 'red', abbr: 'CHP' },
  'RADIATION': { label: 'RADIATION WORK PERMIT', color: 'lime', abbr: 'RWP' },
  'GENERAL': { label: 'GENERAL PERMIT', color: 'gray', abbr: 'GP' },
  'COLD_WORK': { label: 'COLD WORK PERMIT', color: 'cyan', abbr: 'CWP' },
  'LOTO': { label: 'LOTO PERMIT', color: 'indigo', abbr: 'LOTO' },
  'VEHICLE': { label: 'VEHICLE WORK PERMIT', color: 'slate', abbr: 'VWP' },
  'PRESSURE_TESTING': { label: 'HYDRO PRESSURE TESTING', color: 'sky', abbr: 'HPT' },
  'ENERGIZE': { label: 'ENERGIZE PERMIT', color: 'emerald', abbr: 'EOMP' },
  'SWMS': { label: 'SAFE WORK METHOD STATEMENT', color: 'rose', abbr: 'SWMS' },
}

// Default measures for checklist
const defaultMeasures = [
  { id: 1, question: 'Instruction to Personnel regarding hazards involved and working procedure.', answer: null },
  { id: 2, question: 'Are Other Contractors working nearby notified?', answer: null },
  { id: 3, question: 'Is there any other work permit obtained?', answer: null },
  { id: 4, question: 'Are escape routes to be provided and kept clear?', answer: null },
  { id: 5, question: 'Is combustible material to be removed / covered from and nearby site (up to 5mtr min.)', answer: null },
  { id: 6, question: 'Is the area immediately below the work spot been cleared / removed of oil, grease & waste cotton etc...?', answer: null },
  { id: 7, question: 'Has gas connection been tested in case there is gas valve / gas line nearby?', answer: null },
  { id: 8, question: 'Is fire extinguisher been kept handy at site?', answer: null },
  { id: 9, question: 'Has tin sheet / fire retardant cloth/ sheet been placed to contain hot spatters of welding / gas cutting?', answer: null },
  { id: 10, question: 'Have all drain inlets been closed?', answer: null },
]

const statusConfig = {
  'PENDING': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'APPROVED': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'REJECTED': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'CLOSED': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  'EXTENDED': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'REVOKED': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
}

const PermitDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isSafetyOfficer } = useAuth()
  
  const [permit, setPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState(null)
  const [showQrModal, setShowQrModal] = useState(false)
  const [measures, setMeasures] = useState([])
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)
  const [workflowAction, setWorkflowAction] = useState(null)
  const [workflowData, setWorkflowData] = useState({})
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchPermit()
  }, [id])

  const fetchPermit = async () => {
    try {
      const response = await permitsAPI.getById(id)
      const permitData = response.data.permit
      setPermit(permitData)
      
      // Parse measures or use defaults
      const savedMeasures = permitData.measures ? JSON.parse(permitData.measures) : []
      setMeasures(savedMeasures.length > 0 ? savedMeasures : defaultMeasures)
    } catch (error) {
      toast.error('Error fetching permit details')
      navigate('/permits')
    } finally {
      setLoading(false)
    }
  }

  const fetchQrCode = async () => {
    try {
      const response = await permitsAPI.getWorkerQR(id)
      setQrCode(response.data)
      setShowQrModal(true)
    } catch (error) {
      toast.error('Error generating QR code')
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await permitsAPI.downloadPDF(id)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${permit.permitNumber}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      toast.error('Error downloading PDF')
    }
  }

  const handleMeasureChange = async (measureId, answer) => {
    const updatedMeasures = measures.map(m => 
      m.id === measureId ? { ...m, answer } : m
    )
    setMeasures(updatedMeasures)

    try {
      await permitsAPI.updateMeasures(id, updatedMeasures)
    } catch (error) {
      toast.error('Error saving measure')
    }
  }

  const handleWorkflowAction = (action) => {
    setWorkflowAction(action)
    setWorkflowData({})
    setShowWorkflowModal(true)
  }

  const executeWorkflowAction = async () => {
    setActionLoading(true)
    try {
      switch (workflowAction) {
        case 'extend':
          await permitsAPI.extendPermit(id, workflowData)
          toast.success('Permit extended successfully')
          break
        case 'revoke':
          await permitsAPI.revokePermit(id, workflowData)
          toast.success('Permit revoked successfully')
          break
        case 'close':
          await permitsAPI.closePermit(id, workflowData)
          toast.success('Permit closed successfully')
          break
        default:
          break
      }
      setShowWorkflowModal(false)
      fetchPermit()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!permit) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Permit not found</p>
      </div>
    )
  }

  const config = workTypeConfig[permit.workType] || workTypeConfig['GENERAL']
  const status = statusConfig[permit.status] || statusConfig['PENDING']
  const workers = permit.workers ? JSON.parse(permit.workers) : []
  const hazards = permit.hazards || []
  const precautions = permit.precautions || []
  const equipment = permit.equipment || []

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/permits')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Permits
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={fetchQrCode}
            className="btn btn-secondary flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            QR Code
          </button>
          <button
            onClick={handleDownloadPDF}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Professional Permit Document */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            {/* Company & Title */}
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {permit.companyName || 'COMPANY'}
              </h1>
              <h2 className="text-xl font-semibold text-slate-700 mt-1">
                {config.label}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Requested by {permit.user?.firstName} {permit.user?.lastName} on {new Date(permit.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* QR Code & Status */}
            <div className="text-right">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-2 cursor-pointer hover:bg-gray-200"
                   onClick={fetchQrCode}>
                <QrCode className="w-12 h-12 text-gray-400" />
              </div>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${status.bg} ${status.text}`}>
                {permit.status}
              </span>
            </div>
          </div>
          
          {/* Permit Number */}
          <div className="mt-4">
            <span className="text-sm font-mono bg-slate-100 px-3 py-1 rounded text-slate-700">
              {permit.permitNumber}
            </span>
          </div>
        </div>

        {/* Workers Section */}
        <div className="border-b border-gray-200">
          <div className="bg-slate-700 text-white px-4 py-2 font-semibold flex items-center gap-2">
            <Users className="w-4 h-4" />
            WORKERS
          </div>
          <div className="p-4">
            {workers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Company</th>
                      <th className="pb-2 font-medium">Phone</th>
                      <th className="pb-2 font-medium">Badge No.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker, idx) => (
                      <tr key={idx} className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">{worker.name}</td>
                        <td className="py-2 text-gray-600">{worker.company || '-'}</td>
                        <td className="py-2 text-gray-600">{worker.phone || '-'}</td>
                        <td className="py-2 text-gray-600">{worker.badgeNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No workers assigned yet</p>
            )}
            {permit.contractorName && (
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4">
                <span className="text-sm text-gray-500">Contractor:</span>
                <span className="font-medium">{permit.contractorName}</span>
                {permit.contractorPhone && (
                  <span className="text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {permit.contractorPhone}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Location & Duration */}
        <div className="grid md:grid-cols-2 border-b border-gray-200">
          {/* Location */}
          <div className="border-r border-gray-200">
            <div className="bg-slate-700 text-white px-4 py-2 font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              LOCATION OF WORK
            </div>
            <div className="p-4">
              <p className="font-medium text-gray-900">{permit.location}</p>
              <p className="text-sm text-gray-500 mt-1">{permit.timezone || 'UTC'}</p>
            </div>
          </div>
          
          {/* Duration */}
          <div>
            <div className="bg-slate-700 text-white px-4 py-2 font-semibold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              DURATION OF WORK
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Start Time</p>
                  <p className="text-gray-900">{new Date(permit.startDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">End Time</p>
                  <p className="text-gray-900">{new Date(permit.endDate).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Extended</p>
                  <p className={permit.isExtended ? 'text-blue-600 font-semibold' : 'text-gray-900'}>
                    {permit.isExtended ? 'YES' : 'NO'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Measures Checklist */}
        <div className="border-b border-gray-200">
          <div className="bg-slate-700 text-white px-4 py-2 font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            MEASURES
          </div>
          <div className="p-4 space-y-3">
            {measures.map((measure) => (
              <div key={measure.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <p className="text-sm text-gray-700 flex-1 pr-4">{measure.question}</p>
                <div className="flex items-center gap-2">
                  {['YES', 'NO', 'N/A'].map((option) => (
                    <button
                      key={option}
                      onClick={() => handleMeasureChange(measure.id, option)}
                      disabled={permit.status === 'CLOSED'}
                      className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
                        measure.answer === option
                          ? option === 'YES'
                            ? 'bg-emerald-500 text-white'
                            : option === 'NO'
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hazards */}
        {hazards.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="bg-red-600 text-white px-4 py-2 font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              HAZARDS IDENTIFIED
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {hazards.map((hazard, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                    {hazard}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Precautions */}
        {precautions.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="bg-emerald-600 text-white px-4 py-2 font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              SAFETY PRECAUTIONS
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {precautions.map((precaution, idx) => (
                  <span key={idx} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm">
                    {precaution}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Equipment */}
        {equipment.length > 0 && (
          <div className="border-b border-gray-200">
            <div className="bg-blue-600 text-white px-4 py-2 font-semibold flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              REQUIRED EQUIPMENT
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {equipment.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Approvals & Signatures */}
        <div>
          <div className="bg-slate-700 text-white px-4 py-2 font-semibold">
            APPROVALS & SIGNATURES
          </div>
          <div className="p-4 grid md:grid-cols-3 gap-4">
            {permit.approvals?.map((approval, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <p className="text-xs text-gray-500 font-medium uppercase">
                  {approval.approverRole?.replace('_', ' ')}
                </p>
                <p className="font-medium text-gray-900 mt-1">
                  {approval.approverName || 'Pending'}
                </p>
                <span className={`inline-flex mt-2 px-2 py-0.5 rounded text-xs font-semibold ${
                  approval.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                  approval.decision === 'REJECTED' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {approval.decision}
                </span>
                {approval.signature && (
                  <p className="mt-2 italic text-gray-600 font-serif">{approval.signature}</p>
                )}
                {approval.signedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(approval.signedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Actions */}
        {(isAdmin || isSafetyOfficer) && ['APPROVED', 'EXTENDED'].includes(permit.status) && (
          <div className="p-4 bg-gray-50 border-t flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">Actions:</span>
            <button
              onClick={() => handleWorkflowAction('extend')}
              className="btn btn-secondary text-sm flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              Extend
            </button>
            <button
              onClick={() => handleWorkflowAction('revoke')}
              className="btn bg-red-100 text-red-700 hover:bg-red-200 text-sm flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Revoke
            </button>
            <button
              onClick={() => handleWorkflowAction('close')}
              className="btn bg-gray-700 text-white hover:bg-gray-800 text-sm flex items-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              Close PTW
            </button>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQrModal && qrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Worker Registration QR</h3>
              <button onClick={() => setShowQrModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center">
              <img src={qrCode.qrCode} alt="QR Code" className="mx-auto mb-4" />
              <p className="text-sm text-gray-500 mb-2">Scan to register workers</p>
              <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                {qrCode.registrationUrl}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Workflow Action Modal */}
      {showWorkflowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold capitalize">{workflowAction} Permit</h3>
              <button onClick={() => setShowWorkflowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {workflowAction === 'extend' && (
              <div className="space-y-4">
                <div>
                  <label className="label">Extend Until</label>
                  <input
                    type="datetime-local"
                    className="input"
                    onChange={(e) => setWorkflowData({ ...workflowData, extendedUntil: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Reason</label>
                  <textarea
                    className="input"
                    rows={3}
                    placeholder="Reason for extension..."
                    onChange={(e) => setWorkflowData({ ...workflowData, reason: e.target.value })}
                  />
                </div>
              </div>
            )}

            {workflowAction === 'revoke' && (
              <div>
                <label className="label">Reason for Revocation *</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Reason for revoking this permit..."
                  onChange={(e) => setWorkflowData({ ...workflowData, reason: e.target.value })}
                />
              </div>
            )}

            {workflowAction === 'close' && (
              <div>
                <label className="label">Closure Comments</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Any comments for closure..."
                  onChange={(e) => setWorkflowData({ ...workflowData, comments: e.target.value })}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowWorkflowModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={executeWorkflowAction}
                disabled={actionLoading}
                className="btn btn-primary"
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PermitDetail
