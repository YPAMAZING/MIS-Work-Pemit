import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
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
  Wrench,
  Clock,
  Shield,
  ArrowLeft,
  KeyRound,
  RefreshCw,
} from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    phone: '',
    requestedRole: 'REQUESTOR',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)
  
  // OTP States
  const [step, setStep] = useState('form') // 'form', 'otp', 'success'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [devOtp, setDevOtp] = useState('') // For development only
  
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const roles = [
    {
      id: 'REQUESTOR',
      name: 'Requestor',
      description: 'Create and track work permits',
      icon: ClipboardCheck,
      color: 'emerald',
      requiresApproval: false,
    },
    {
      id: 'SAFETY_OFFICER',
      name: 'Safety Officer',
      description: 'Review and approve permits',
      icon: HardHat,
      color: 'blue',
      requiresApproval: true,
    },
    {
      id: 'SITE_ENGINEER',
      name: 'Site Engineer',
      description: 'Meter readings & OCR',
      icon: Wrench,
      color: 'orange',
      requiresApproval: true,
    },
    {
      id: 'ADMIN',
      name: 'Admin',
      description: 'Full system access',
      icon: Shield,
      color: 'purple',
      requiresApproval: true,
    },
  ]

  const handleSendOTP = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (!formData.phone) {
      toast.error('Phone number is required for OTP verification')
      return
    }

    setOtpLoading(true)

    try {
      const { confirmPassword, ...sendData } = formData
      const response = await authAPI.sendOTP(sendData)
      
      setOtpSent(true)
      setStep('otp')
      setResendTimer(60) // 60 seconds cooldown
      
      // For development - show OTP in toast
      if (response.data.otp) {
        setDevOtp(response.data.otp)
        toast.success(`OTP sent! (Dev mode: ${response.data.otp})`)
      } else {
        toast.success('OTP sent to your email and phone!')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('')
    
    if (otpValue.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)

    try {
      const response = await authAPI.verifyOTP({
        email: formData.email,
        phone: formData.phone,
        otp: otpValue,
      })
      
      if (response.data.requiresApproval) {
        setPendingApproval(true)
        setStep('success')
        toast.success('Registration submitted for approval!')
      } else {
        // Store token and redirect
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
        }
        toast.success('Account created successfully!')
        navigate('/dashboard')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    
    setOtpLoading(true)
    try {
      const { confirmPassword, ...sendData } = formData
      const response = await authAPI.sendOTP(sendData)
      setResendTimer(60)
      setOtp(['', '', '', '', '', ''])
      
      if (response.data.otp) {
        setDevOtp(response.data.otp)
        toast.success(`OTP resent! (Dev mode: ${response.data.otp})`)
      } else {
        toast.success('OTP resent successfully!')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error resending OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6).split('')
      const newOtp = [...otp]
      pastedValue.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char
        }
      })
      setOtp(newOtp)
      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedValue.length, 5)
      document.getElementById(`otp-${nextIndex}`)?.focus()
      return
    }
    
    if (!/^\d*$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const selectedRole = roles.find(r => r.id === formData.requestedRole)

  // Success screen for pending approval
  if (step === 'success' && pendingApproval) {
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

  // OTP Verification Step
  if (step === 'otp') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className={`max-w-md w-full transition-all duration-500 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#1e3a6e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <KeyRound className="w-8 h-8 text-[#1e3a6e]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify OTP</h2>
              <p className="text-gray-500 text-sm">
                We've sent a 6-digit code to<br />
                <span className="font-medium text-gray-700">{formData.email}</span> and <span className="font-medium text-gray-700">{formData.phone}</span>
              </p>
            </div>

            {/* Dev mode OTP display */}
            {devOtp && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 text-center">
                <p className="text-xs text-yellow-600">Development Mode - OTP:</p>
                <p className="text-lg font-bold text-yellow-800 tracking-widest">{devOtp}</p>
              </div>
            )}

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 outline-none transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 bg-gradient-to-r from-[#1e3a6e] to-[#2a4a80] hover:from-[#162d57] hover:to-[#1e3a6e] text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Verify & Create Account
                </>
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm">
                Didn't receive the code?{' '}
                {resendTimer > 0 ? (
                  <span className="text-gray-400">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={otpLoading}
                    className="text-[#1e3a6e] font-semibold hover:text-[#162d57] inline-flex items-center gap-1"
                  >
                    {otpLoading ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

            <form onSubmit={handleSendOTP} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name *</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a6e] transition-colors" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all duration-200 outline-none text-sm"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name *</label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a6e] transition-colors" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all duration-200 outline-none text-sm"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email Address *</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a6e] transition-colors" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all duration-200 outline-none text-sm"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a6e] transition-colors" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all duration-200 outline-none text-sm"
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <div className="relative group">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a6e] transition-colors" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all duration-200 outline-none text-sm"
                    placeholder="Operations / MEP / Engineering"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a6e] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all duration-200 outline-none text-sm"
                      placeholder="Min. 6 chars"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password *</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a6e] transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all duration-200 outline-none text-sm"
                      placeholder="Confirm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  OTP will be sent to your email and phone for verification
                </p>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 bg-gradient-to-r from-[#1e3a6e] to-[#2a4a80] hover:from-[#162d57] hover:to-[#1e3a6e] text-white font-semibold rounded-xl shadow-lg shadow-[#1e3a6e]/25 hover:shadow-xl hover:shadow-[#1e3a6e]/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm mt-2"
              >
                {otpLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send OTP & Continue</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-[#1e3a6e] font-semibold hover:text-[#162d57] transition-colors">
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
