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
      requiresApproval: true,
      showCompanyName: true,
    },
    {
      id: 'SAFETY_OFFICER',
      name: 'Fireman',
      description: 'Review and approve permits',
      icon: HardHat,
      requiresApproval: true,
      showCompanyName: false,
    },
    {
      id: 'ADMIN',
      name: 'Admin',
      description: 'Full system access',
      icon: Shield,
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

  // Success screen for pending approval - illustrative style
  if (registrationSuccess && pendingApproval) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
        <div className={`max-w-md w-full transition-all duration-700 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="relative">
            <div className="absolute -inset-1 border border-dashed border-white/20 rounded-3xl" />
            <div className="bg-[#111111] rounded-2xl p-10 text-center border border-white/10 relative">
              {/* Animated clock icon */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 border-2 border-dashed border-amber-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 border border-amber-500/50 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-10 h-10 text-amber-500" />
                </div>
              </div>
              
              <h2 className="text-2xl font-light text-white tracking-wide mb-3">Registration Pending</h2>
              <p className="text-white/50 mb-8">
                Your registration as <span className="text-white font-medium">{selectedRole?.name}</span> is awaiting admin approval.
              </p>
              
              {/* Info box with illustrative style */}
              <div className="relative mb-8">
                <div className="absolute inset-0 border border-dashed border-amber-500/30 rounded-xl" />
                <div className="bg-amber-500/5 rounded-xl p-5 border border-amber-500/20">
                  <p className="text-sm text-amber-200/80 leading-relaxed">
                    <strong className="text-amber-200">What happens next?</strong><br />
                    An administrator will review your request. You'll be able to login once approved.
                  </p>
                </div>
              </div>
              
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#0a0a0a] font-semibold rounded-xl hover:bg-white/90 transition-all group"
              >
                Back to Login
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Input field component with illustrative style
  const InputField = ({ label, name, type = 'text', icon: Icon, placeholder, required = false, value, showPasswordToggle = false }) => (
    <div className="relative">
      <label className="block text-xs font-medium text-white/70 mb-2 tracking-wider uppercase">{label}</label>
      <div className={`relative transition-all duration-300 ${focusedField === name ? 'transform scale-[1.01]' : ''}`}>
        <div className={`absolute inset-0 border ${focusedField === name ? 'border-white/50' : 'border-white/20'} rounded-xl transition-colors duration-300`} />
        <div className={`absolute left-0 top-0 bottom-0 w-10 border-r ${focusedField === name ? 'border-white/50' : 'border-white/20'} rounded-l-xl flex items-center justify-center transition-colors duration-300`}>
          <Icon className={`w-4 h-4 transition-colors duration-300 ${focusedField === name ? 'text-white' : 'text-white/40'}`} />
        </div>
        <input
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          name={name}
          value={value}
          onChange={handleChange}
          onFocus={() => setFocusedField(name)}
          onBlur={() => setFocusedField(null)}
          className="w-full pl-14 pr-4 py-3 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm rounded-xl"
          placeholder={placeholder}
          required={required}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0a0a0a]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[38%] relative">
        {/* Animated SVG background */}
        <div className="absolute inset-0 overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Decorative circles */}
          <div className="absolute top-20 left-16 w-28 h-28 border border-white/20 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute top-24 left-20 w-20 h-20 border border-dashed border-white/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute bottom-40 right-16 w-36 h-36 border border-white/10 rounded-full animate-[spin_25s_linear_infinite]" />
        </div>
        
        {/* Content */}
        <div className={`relative z-10 flex flex-col justify-center items-center w-full px-8 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          {/* Logo */}
          <div className="mb-8 relative">
            <div className="absolute -inset-2 border-2 border-dashed border-white/40 rounded-2xl animate-pulse" />
            <div className="bg-white rounded-xl p-4 relative shadow-2xl shadow-white/10">
              <img 
                src="/logo.png" 
                alt="Reliable Group Logo" 
                className="h-20 w-auto"
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-light text-white tracking-wider mb-2">
              Reliable Group <span className="text-red-400 animate-pulse">|</span> MEP
            </h2>
            <p className="text-white/50 text-sm tracking-widest uppercase">
              Work Permit System
            </p>
          </div>

          {/* Benefits with illustrative style */}
          <div className="space-y-3 max-w-xs">
            {[
              'Submit permit requests easily',
              'Track approval status in real-time',
              'Digital signatures & documentation',
            ].map((benefit, index) => (
              <div 
                key={benefit}
                className="flex items-center gap-3 text-white/70 text-sm"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-5 h-5 border border-green-400/50 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-green-400" />
                </div>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Company badge */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-white/30 text-xs tracking-wider">Powered by</p>
            <p className="text-white/60 font-medium text-sm mt-1">
              YP SECURITY SERVICES PVT LTD
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-[62%] flex items-center justify-center p-4 bg-[#0a0a0a] overflow-y-auto">
        <div className={`w-full max-w-xl transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-block bg-white rounded-xl p-2 shadow-lg mb-2">
              <img 
                src="/logo.png" 
                alt="Reliable Group Logo" 
                className="h-12 w-auto"
              />
            </div>
            <h2 className="text-base font-light text-white tracking-wider">Reliable Group <span className="text-red-400">|</span> MEP</h2>
          </div>

          {/* Register card - illustrative style */}
          <div className="relative">
            <div className="absolute -inset-1 border border-dashed border-white/20 rounded-3xl" />
            
            <div className="bg-[#111111] rounded-2xl p-6 relative border border-white/10">
              {/* Corner accents */}
              <div className="absolute top-0 left-6 w-12 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <div className="absolute bottom-0 right-6 w-12 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 border border-white/30 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-white/70" />
                  </div>
                  <h2 className="text-xl font-light text-white tracking-wide">Create Account</h2>
                </div>
                <p className="text-white/50 text-sm">Register to access the work permit system</p>
              </div>

              {/* Role Selection - illustrative style */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-white/70 mb-3 tracking-wider uppercase">Select Your Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((role) => {
                    const Icon = role.icon
                    const isSelected = formData.requestedRole === role.id
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, requestedRole: role.id })}
                        className={`relative p-4 rounded-xl transition-all duration-300 text-center group ${
                          isSelected 
                            ? 'bg-white/10 border-white/50' 
                            : 'border-white/20 hover:border-white/30'
                        } border`}
                      >
                        {/* Animated border on selected */}
                        {isSelected && (
                          <div className="absolute inset-0 border-2 border-white/30 rounded-xl animate-pulse" />
                        )}
                        
                        <div className={`w-10 h-10 mx-auto mb-2 border rounded-full flex items-center justify-center transition-all duration-300 ${
                          isSelected ? 'border-white bg-white/10' : 'border-white/30 group-hover:border-white/50'
                        }`}>
                          <Icon className={`w-5 h-5 transition-colors duration-300 ${
                            isSelected ? 'text-white' : 'text-white/50'
                          }`} />
                        </div>
                        <p className={`text-sm font-medium transition-colors duration-300 ${
                          isSelected ? 'text-white' : 'text-white/60'
                        }`}>
                          {role.name}
                        </p>
                        {role.requiresApproval && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500/20 border border-amber-500/50 rounded-full flex items-center justify-center">
                            <Clock className="w-3 h-3 text-amber-400" />
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                {selectedRole?.requiresApproval && (
                  <p className="text-xs text-amber-400/80 mt-3 flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    This role requires admin approval
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="First Name"
                    name="firstName"
                    icon={User}
                    placeholder="John"
                    required
                    value={formData.firstName}
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    icon={User}
                    placeholder="Doe"
                    required
                    value={formData.lastName}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    icon={Mail}
                    placeholder="john@company.com"
                    required
                    value={formData.email}
                  />
                  <InputField
                    label="Phone"
                    name="phone"
                    type="tel"
                    icon={Phone}
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                  />
                </div>

                <InputField
                  label={selectedRole?.showCompanyName ? 'Company Name *' : 'Department'}
                  name="department"
                  icon={Building}
                  placeholder={selectedRole?.showCompanyName ? "Your company name" : "Operations / MEP"}
                  required={selectedRole?.showCompanyName}
                  value={formData.department}
                />
                {selectedRole?.showCompanyName && (
                  <p className="text-xs text-white/40 -mt-2">This will be used as your company name for permits</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Password"
                    name="password"
                    icon={Lock}
                    placeholder="Min. 6 chars"
                    required
                    value={formData.password}
                    showPasswordToggle
                  />
                  <InputField
                    label="Confirm"
                    name="confirmPassword"
                    icon={Lock}
                    placeholder="Confirm"
                    required
                    value={formData.confirmPassword}
                    showPasswordToggle
                  />
                </div>

                {/* Consent Checkbox - Creative animated style */}
                <div className="mt-5">
                  <label className="flex items-start gap-4 cursor-pointer group">
                    <div className="relative flex-shrink-0 mt-0.5">
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="peer sr-only"
                      />
                      {/* Animated checkbox */}
                      <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-500 relative overflow-hidden ${
                        consentChecked ? 'border-white bg-white' : 'border-white/30 group-hover:border-white/50'
                      }`}>
                        <svg
                          className={`absolute inset-0 w-full h-full p-1 transition-all duration-300 ${
                            consentChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0a0a0a"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      {consentChecked && (
                        <div className="absolute inset-0 rounded-lg border-2 border-white animate-ping opacity-50" />
                      )}
                    </div>
                    <span className="text-xs text-white/50 leading-relaxed">
                      I acknowledge that I am providing my personal information voluntarily. I consent to the collection and processing of my data for account creation and work permit management. I agree to the{' '}
                      <a href="#" className="text-white/70 hover:text-white underline">Terms of Service</a>{' '}
                      and{' '}
                      <a href="#" className="text-white/70 hover:text-white underline">Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || !consentChecked}
                  className="w-full py-4 mt-4 relative group overflow-hidden rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-white rounded-xl" />
                  <div className="absolute inset-0 border-2 border-white rounded-xl group-hover:border-dashed transition-all duration-300" />
                  
                  <div className="absolute top-0 left-0 w-0 h-0 border-t-2 border-l-2 border-[#0a0a0a] group-hover:w-4 group-hover:h-4 transition-all duration-300" />
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-b-2 border-r-2 border-[#0a0a0a] group-hover:w-4 group-hover:h-4 transition-all duration-300" />
                  
                  <span className="relative flex items-center justify-center gap-2 text-[#0a0a0a] font-semibold text-sm">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                        <span>Creating account...</span>
                      </>
                    ) : (
                      <>
                        <span>{selectedRole?.requiresApproval ? 'Submit for Approval' : 'Create Account'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-white/20" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#111111] text-white/40 text-xs tracking-wider">ALREADY REGISTERED?</span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors group"
                >
                  <span>Sign in to your account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright - Mobile */}
          <p className="text-center text-white/30 text-xs mt-4 lg:hidden tracking-wider">
            © 2025 YP SECURITY SERVICES PVT LTD
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
