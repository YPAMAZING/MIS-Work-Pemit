import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  Mail, 
  Lock, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight,
  CheckCircle2,
  UserPlus,
  Phone,
  HardHat,
  ClipboardCheck,
  Clock,
  Shield
} from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    companyName: '',
    phone: '',
    requestedRole: 'REQUESTOR',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const roles = [
    {
      id: 'REQUESTOR',
      name: 'Requestor',
      description: 'Create and track work permits',
      icon: ClipboardCheck,
      color: 'emerald',
      requiresApproval: true,
      showCompanyName: true,
    },
    {
      id: 'SAFETY_OFFICER',
      name: 'Fireman',
      description: 'Review and approve permits',
      icon: HardHat,
      color: 'blue',
      requiresApproval: true,
      showCompanyName: false,
    },
    {
      id: 'ADMIN',
      name: 'Admin',
      description: 'Full system access',
      icon: Shield,
      color: 'purple',
      requiresApproval: true,
      showCompanyName: false,
    },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!consentChecked) {
      toast.error('Please accept the terms and privacy policy')
      return
    }

    if (selectedRole?.showCompanyName && !formData.department.trim()) {
      toast.error('Company name is required for Requestor')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      const response = await register(registerData)
      
      if (response?.requiresApproval) {
        setPendingApproval(true)
        setRegistrationSuccess(true)
        toast.success('Registration submitted for approval!')
      } else {
        toast.success('Account created successfully!')
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const selectedRole = roles.find(r => r.id === formData.requestedRole)

  // Floating Label Input Component
  const FloatingInput = ({ 
    label, 
    name, 
    type = 'text', 
    icon: Icon, 
    value, 
    showPasswordToggle = false,
    required = false 
  }) => {
    const isFocused = focusedField === name
    const hasValue = value && value.length > 0
    const isFloating = isFocused || hasValue

    return (
      <div className="relative">
        <div className={`relative border-2 rounded-xl transition-all duration-300 ${
          isFocused 
            ? 'border-[#1e3a6e] shadow-lg shadow-[#1e3a6e]/10' 
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          {/* Icon */}
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
            isFocused ? 'text-[#1e3a6e]' : 'text-gray-400'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          
          {/* Input */}
          <input
            type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
            name={name}
            id={name}
            value={value}
            onChange={handleChange}
            onFocus={() => setFocusedField(name)}
            onBlur={() => setFocusedField(null)}
            className="w-full pl-10 pr-3 pt-5 pb-1.5 bg-transparent text-gray-900 focus:outline-none text-sm rounded-xl"
            required={required}
          />
          
          {/* Floating Label */}
          <label
            htmlFor={name}
            className={`absolute left-10 transition-all duration-300 pointer-events-none ${
              isFloating
                ? 'top-1 text-[10px] font-medium text-[#1e3a6e]'
                : 'top-1/2 -translate-y-1/2 text-sm text-gray-400'
            }`}
          >
            {label}
          </label>
          
          {/* Password Toggle */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
    )
  }

  // Success screen for pending approval
  if (registrationSuccess && pendingApproval) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className={`max-w-md w-full transition-all duration-500 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Pending</h2>
            <p className="text-gray-500 mb-6">
              Your registration as <span className="font-semibold text-gray-700">{selectedRole?.name}</span> has been submitted and is awaiting admin approval.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>What happens next?</strong><br />
                An administrator will review your request and approve your account. You'll be able to login once approved.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a6e] text-white font-semibold rounded-xl hover:bg-[#162d57] transition-colors"
            >
              Back to Login
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[40%] relative bg-gradient-to-br from-[#1e3a6e] via-[#1e3a6e] to-[#0f2444]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-48 h-48 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Content */}
        <div className={`relative z-10 flex flex-col justify-center items-center w-full px-8 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          {/* Logo */}
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-5 inline-block shadow-2xl">
              <img 
                src="/logo.png" 
                alt="Reliable Group Logo" 
                className="h-24 w-auto"
              />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white leading-tight mb-2">
              Reliable Group <span className="text-red-400">|</span> MEP
            </h2>
            <p className="text-blue-200 text-sm">
              Work Permit Management System
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 max-w-xs">
            {[
              'Submit permit requests easily',
              'Track approval status in real-time',
              'Digital signatures & documentation',
            ].map((benefit, index) => (
              <div 
                key={benefit}
                className="flex items-center gap-2 text-blue-100 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Company badge */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-blue-300 text-xs">Powered by</p>
            <p className="text-white font-semibold text-sm mt-1">
              YP SECURITY SERVICES PVT LTD
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-4 bg-gray-50 overflow-y-auto">
        <div className={`w-full max-w-lg transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-4">
            <div className="inline-block bg-white rounded-xl p-2 shadow-lg mb-2">
              <img 
                src="/logo.png" 
                alt="Reliable Group Logo" 
                className="h-12 w-auto"
              />
            </div>
            <h2 className="text-base font-bold text-gray-900">Reliable Group <span className="text-red-500">|</span> MEP</h2>
          </div>

          {/* Register card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-5">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-[#1e3a6e]" />
                <h2 className="text-xl font-bold text-gray-900">Create Account</h2>
              </div>
              <p className="text-gray-500 text-sm">Register to access the work permit system</p>
            </div>

            {/* Role Selection */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">Select Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((role) => {
                  const Icon = role.icon
                  const isSelected = formData.requestedRole === role.id
                  const colorStyles = {
                    emerald: { border: '#10b981', bg: '#ecfdf5', text: 'text-emerald-600' },
                    blue: { border: '#3b82f6', bg: '#eff6ff', text: 'text-blue-600' },
                    orange: { border: '#f97316', bg: '#fff7ed', text: 'text-orange-600' },
                    purple: { border: '#a855f7', bg: '#faf5ff', text: 'text-purple-600' },
                  }
                  const colors = colorStyles[role.color] || colorStyles.emerald
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, requestedRole: role.id })}
                      className={`relative p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                        isSelected 
                          ? 'ring-2 ring-opacity-20' 
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      style={{
                        borderColor: isSelected ? colors.border : undefined,
                        backgroundColor: isSelected ? colors.bg : undefined,
                        '--tw-ring-color': isSelected ? colors.border : undefined,
                      }}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1 ${
                        isSelected ? colors.text : 'text-gray-400'
                      }`} />
                      <p className={`text-xs font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        {role.name}
                      </p>
                      {role.requiresApproval && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                          <Clock className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
              {selectedRole?.requiresApproval && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  This role requires admin approval after registration
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="First Name"
                  name="firstName"
                  icon={User}
                  value={formData.firstName}
                  required
                />
                <FloatingInput
                  label="Last Name"
                  name="lastName"
                  icon={User}
                  value={formData.lastName}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  required
                />
                <FloatingInput
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  icon={Phone}
                  value={formData.phone}
                />
              </div>

              <FloatingInput
                label={selectedRole?.showCompanyName ? 'Company Name *' : 'Department'}
                name="department"
                icon={Building}
                value={formData.department}
                required={selectedRole?.showCompanyName}
              />
              {selectedRole?.showCompanyName && (
                <p className="text-xs text-gray-500 -mt-1">This will be used as your company/contractor name for permits</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <FloatingInput
                  label="Password"
                  name="password"
                  icon={Lock}
                  value={formData.password}
                  showPasswordToggle
                  required
                />
                <FloatingInput
                  label="Confirm Password"
                  name="confirmPassword"
                  icon={Lock}
                  value={formData.confirmPassword}
                  showPasswordToggle
                  required
                />
              </div>

              {/* Consent Checkbox */}
              <div className="mt-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className={`w-5 h-5 border-2 rounded-md transition-all duration-300 flex items-center justify-center ${
                      consentChecked 
                        ? 'border-[#1e3a6e] bg-[#1e3a6e]' 
                        : 'border-gray-300 group-hover:border-[#1e3a6e]/50'
                    }`}>
                      <svg
                        className={`w-3 h-3 text-white transition-all duration-300 ${
                          consentChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I acknowledge that I am providing my personal information voluntarily. I consent to the collection, storage, and processing of my data for the purpose of account creation and work permit management. I have read and agree to the{' '}
                    <a href="#" className="text-[#1e3a6e] font-semibold hover:underline">Terms of Service</a>{' '}
                    and{' '}
                    <a href="#" className="text-[#1e3a6e] font-semibold hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !consentChecked}
                className="w-full py-3 bg-gradient-to-r from-[#1e3a6e] to-[#2a4a80] hover:from-[#162d57] hover:to-[#1e3a6e] text-white font-semibold rounded-xl shadow-lg shadow-[#1e3a6e]/25 hover:shadow-xl hover:shadow-[#1e3a6e]/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm mt-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>{selectedRole?.requiresApproval ? 'Submit for Approval' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-[#1e3a6e] font-semibold hover:text-[#162d57] transition-colors underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Copyright - Mobile */}
          <p className="text-center text-gray-400 text-xs mt-3 lg:hidden">
            © 2025 YP SECURITY SERVICES PVT LTD
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
