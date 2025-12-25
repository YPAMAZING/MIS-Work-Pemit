import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { permitsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'
import SignatureCanvas from '../components/SignatureCanvas'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Download,
  Printer,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  Users,
  AlertTriangle,
  Shield,
  FileText,
  QrCode,
  Building,
  Phone,
  Flame,
  Box,
  Zap,
  ArrowUpFromLine,
  Share2,
  RefreshCw,
  XSquare,
  CheckSquare,
} from 'lucide-react'

// Work type config
const workTypeConfig = {
  HOT_WORK: { label: 'HOT WORK PERMIT', abbr: 'HWP', icon: Flame, color: 'orange' },
  CONFINED_SPACE: { label: 'CONFINED SPACE PERMIT', abbr: 'CSP', icon: Box, color: 'purple' },
  ELECTRICAL: { label: 'ELECTRICAL WORK PERMIT', abbr: 'EWP', icon: Zap, color: 'yellow' },
  WORKING_AT_HEIGHT: { label: 'WORK AT HEIGHT PERMIT', abbr: 'WHP', icon: ArrowUpFromLine, color: 'blue' },
  EXCAVATION: { label: 'EXCAVATION PERMIT', abbr: 'EXP', color: 'amber' },
  LIFTING: { label: 'LIFTING PERMIT', abbr: 'LP', color: 'teal' },
  CHEMICAL: { label: 'CHEMICAL HANDLING PERMIT', abbr: 'CHP', color: 'red' },
  RADIATION: { label: 'RADIATION WORK PERMIT', abbr: 'RWP', color: 'lime' },
  GENERAL: { label: 'GENERAL PERMIT', abbr: 'GP', icon: FileText, color: 'gray' },
  COLD_WORK: { label: 'COLD WORK PERMIT', abbr: 'CWP', color: 'cyan' },
  LOTO: { label: 'LOTO PERMIT', abbr: 'LOTO', color: 'indigo' },
}

// Default safety measures checklist
const defaultMeasures = [
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
]

const PermitDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin, isSafetyOfficer } = useAuth()
  const permitRef = useRef(null)
  
  const [permit, setPermit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [measures, setMeasures] = useState(defaultMeasures)

  useEffect(() => {
    fetchPermit()
  }, [id])

  const fetchPermit = async () => {
    try {
      const response = await permitsAPI.getById(id)
      const permitData = response.data.permit
      setPermit(permitData)
      
      // Load measures if available
      if (permitData.measures && permitData.measures.length > 0) {
        setMeasures(permitData.measures)
      }
    } catch (error) {
      toast.error('Error fetching permit details')
      navigate('/permits')
    } finally {
      setLoading(false)
    }
  }

  const generatePermitNumber = () => {
    if (!permit) return ''
    const typeConfig = workTypeConfig[permit.workType] || { abbr: 'GP' }
    const date = new Date(permit.createdAt)
    const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}${date.getFullYear().toString().slice(-2)}`
    return `${typeConfig.abbr}${dateStr}${permit.id.slice(0, 4).toUpperCase()}`
  }

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Closed' },
      EXTENDED: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Extended' },
    }
    return badges[status] || badges.PENDING
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const formatDateTime = (date) => {
    return `${formatDate(date)}, ${formatTime(date)}`
  }

  const handleMeasureResponse = (measureId, response) => {
    setMeasures(prev => prev.map(m => 
      m.id === measureId ? { ...m, response } : m
    ))
  }

  const generatePDF = async () => {
    if (!permitRef.current) return
    
    setGenerating(true)
    try {
      const element = permitRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${generatePermitNumber()}_permit.pdf`)
      toast.success('PDF generated successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Error generating PDF')
    } finally {
      setGenerating(false)
    }
  }

  const getQRData = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/worker-registration/${id}`
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
        <p className="text-gray-500">Permit not found</p>
      </div>
    )
  }

  const typeConfig = workTypeConfig[permit.workType] || { label: 'WORK PERMIT', abbr: 'GP', color: 'gray' }
  const statusBadge = getStatusBadge(permit.status)
  const permitNumber = generatePermitNumber()
  const approval = permit.approvals?.[0]

  return (
    <div className="animate-fade-in">
      {/* Header Actions */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate('/permits')}
          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Permits
        </button>

        <div className="flex items-center gap-2">
          {(isAdmin || isSafetyOfficer || permit.createdBy === user?.id) && permit.status === 'PENDING' && (
            <Link
              to={`/permits/${id}/edit`}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          )}
          <button
            onClick={() => window.print()}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          <button
            onClick={generatePDF}
            disabled={generating}
            className="btn btn-primary flex items-center gap-2"
          >
            {generating ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download PDF
          </button>
        </div>
      </div>

      {/* Permit Document */}
      <div ref={permitRef} className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Document Header */}
        <div className="bg-white p-6 border-b-2 border-gray-200">
          <div className="flex items-start justify-between">
            {/* Company Logo & Name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
                <Building className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{permit.companyName || 'ACME'}</h1>
                <p className="text-sm text-gray-500">Industrial Safety Management</p>
              </div>
            </div>

            {/* Permit Title */}
            <div className="text-center flex-1 px-4">
              <h2 className="text-xl font-bold text-gray-900">{typeConfig.label}</h2>
              <p className="text-sm text-gray-500">
                Requested by {permit.user?.firstName} {permit.user?.lastName} on {formatDate(permit.createdAt)}
              </p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center">
              <QRCodeSVG 
                value={getQRData()} 
                size={80}
                level="M"
                includeMargin={false}
              />
              <p className="text-xs text-gray-400 mt-1">Scan to add workers</p>
            </div>
          </div>

          {/* Permit Number & Status */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="font-mono font-bold text-gray-900">{permitNumber}</span>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
              Status: {statusBadge.label}
            </div>
          </div>
        </div>

        {/* Workers Section */}
        <div className="border-b border-gray-200">
          <div className="bg-slate-700 text-white text-center py-2 font-semibold">
            WORKERS
          </div>
          <div className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">
                    {permit.contractorName || 'Contractor A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone className="w-4 h-4" />
                  <span>{permit.contractorPhone || '0123456789'}</span>
                </div>
              </div>
              {permit.workers && JSON.parse(permit.workers || '[]').map((worker, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">{worker.name?.[0] || 'W'}</span>
                    </div>
                    <span className="font-medium text-gray-900">{worker.name}</span>
                  </div>
                  <span className="text-gray-500">{worker.trade || 'Worker'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location & Duration */}
        <div className="grid md:grid-cols-2 border-b border-gray-200">
          {/* Location */}
          <div className="border-r border-gray-200">
            <div className="bg-slate-600 text-white text-center py-2 font-semibold">
              LOCATION OF WORK
            </div>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{permit.location}</p>
                  <p className="text-sm text-gray-500">{permit.timezone || 'UTC'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="bg-slate-600 text-white text-center py-2 font-semibold">
              DURATION OF WORK
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Start Time</p>
                  <p className="font-medium text-gray-900 text-sm">{formatDateTime(permit.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">End Time</p>
                  <p className="font-medium text-gray-900 text-sm">{formatDateTime(permit.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Extended</p>
                  <p className={`font-semibold text-sm ${permit.isExtended ? 'text-blue-600' : 'text-gray-900'}`}>
                    {permit.isExtended ? 'YES' : 'NO'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Safety Measures Checklist */}
        <div className="border-b border-gray-200">
          <div className="bg-slate-700 text-white text-center py-2 font-semibold">
            MEASURES
          </div>
          <div className="divide-y divide-gray-100">
            {measures.map((measure, idx) => (
              <div key={measure.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                <p className="text-sm text-gray-700 flex-1 pr-4">{measure.question}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMeasureResponse(measure.id, 'YES')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      measure.response === 'YES' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    YES
                  </button>
                  <button
                    onClick={() => handleMeasureResponse(measure.id, 'NO')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      measure.response === 'NO' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}
                  >
                    NO
                  </button>
                  <button
                    onClick={() => handleMeasureResponse(measure.id, 'N/A')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                      measure.response === 'N/A' 
                        ? 'bg-gray-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    N/A
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hazards & Precautions */}
        {(permit.hazards?.length > 0 || permit.precautions?.length > 0) && (
          <div className="grid md:grid-cols-2 border-b border-gray-200">
            {/* Hazards */}
            <div className="border-r border-gray-200">
              <div className="bg-red-600 text-white text-center py-2 font-semibold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                HAZARDS IDENTIFIED
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {(permit.hazards || []).map((hazard, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      {hazard}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Precautions */}
            <div>
              <div className="bg-green-600 text-white text-center py-2 font-semibold flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                SAFETY PRECAUTIONS
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {(permit.precautions || []).map((precaution, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {precaution}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Approval Section with Signature */}
        <div className="border-b border-gray-200">
          <div className="bg-slate-700 text-white text-center py-2 font-semibold">
            APPROVAL
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Requestor Signature */}
              <div className="border rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Requested By</p>
                <p className="font-semibold text-gray-900">{permit.user?.firstName} {permit.user?.lastName}</p>
                <p className="text-sm text-gray-500">{permit.user?.department || 'Operations'}</p>
                <div className="mt-4 h-20 border-b-2 border-gray-300 border-dashed flex items-end justify-center">
                  <p className="text-xs text-gray-400 mb-1">Requestor Signature</p>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">{formatDate(permit.createdAt)}</p>
              </div>

              {/* Approver Signature */}
              <div className="border rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Approved By</p>
                {approval?.decision === 'APPROVED' ? (
                  <>
                    <p className="font-semibold text-gray-900">{approval.approverName || 'Safety Officer'}</p>
                    <p className="text-sm text-gray-500">{approval.approverRole}</p>
                    <div className="mt-4 h-20 border-b-2 border-gray-300 border-dashed flex items-end justify-center">
                      {approval.signature ? (
                        <img src={approval.signature} alt="Signature" className="h-16 object-contain" />
                      ) : (
                        <p className="text-xs text-gray-400 mb-1">Approver Signature</p>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {approval.approvedAt ? formatDate(approval.approvedAt) : 'Pending'}
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-32 text-gray-400">
                    <p className="text-sm">Awaiting Approval</p>
                  </div>
                )}
              </div>
            </div>

            {/* Approval Comment */}
            {approval?.comment && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-1">Approval Comments</p>
                <p className="text-gray-700">{approval.comment}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
          <p>This permit is valid only for the specified duration and location. Any extension requires re-approval.</p>
          <p className="mt-1">Generated by MIS - Work Permit Management System</p>
        </div>
      </div>

      {/* PTW Actions (for approved permits) */}
      {permit.status === 'APPROVED' && (isAdmin || isSafetyOfficer) && (
        <div className="mt-6 card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Permit Actions</h3>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-secondary flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Extend PTW
              </button>
              <button className="btn btn-secondary flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Transfer PTW
              </button>
              <button className="btn btn-secondary flex items-center gap-2 text-red-600 hover:bg-red-50">
                <XSquare className="w-4 h-4" />
                Revoke PTW
              </button>
              <button className="btn btn-primary flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                Close PTW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code for Vendor */}
      <div className="mt-6 card">
        <div className="card-header flex items-center gap-2">
          <QrCode className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">Vendor/Contractor QR Code</h3>
        </div>
        <div className="card-body">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-white border-2 border-dashed border-gray-300 rounded-xl">
              <QRCodeSVG 
                value={getQRData()} 
                size={150}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-2">Share with Contractor</h4>
              <p className="text-gray-600 text-sm mb-4">
                Contractors can scan this QR code to register their workers for this permit.
                They'll be able to add worker details including name, phone, trade, and badge number.
              </p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={getQRData()}
                  className="input flex-1 text-sm bg-gray-50"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(getQRData())
                    toast.success('Link copied!')
                  }}
                  className="btn btn-secondary"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PermitDetail
