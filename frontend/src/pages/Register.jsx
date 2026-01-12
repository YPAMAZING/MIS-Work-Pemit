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
  UserPlus
} from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

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
      await register(registerData)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-[#1e3a6e] via-[#1e3a6e] to-[#0f2444]">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-48 h-48 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Content */}
        <div className={`relative z-10 flex flex-col justify-center px-10 xl:px-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          {/* Logo */}
          <div className="mb-8">
            <div className="bg-white rounded-xl p-4 inline-block shadow-xl">
              <img 
                src="https://www.genspark.ai/api/files/s/A7LiItwb" 
                alt="Reliable Group Logo" 
                className="h-20 w-auto"
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-3">
              Join Our Safety
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-300">
                Management Platform
              </span>
            </h2>
            <p className="text-blue-200 text-sm max-w-sm">
              Create your account and start managing work permits efficiently.
            </p>
          </div>

          {/* Benefits - Compact */}
          <div className="space-y-3 mb-8">
            {[
              'Submit permit requests easily',
              'Track approval status in real-time',
              'Digital signatures & documentation',
              'Mobile-friendly interface'
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
          <div className="pt-6 border-t border-blue-400/30">
            <p className="text-blue-300 text-xs">Powered by</p>
            <p className="text-white font-semibold text-sm mt-1">
              YP SECURITY SERVICES PVT LTD
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-4 sm:p-6 bg-gray-50">
        <div className={`w-full max-w-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-4">
            <div className="inline-block bg-white rounded-xl p-3 shadow-lg mb-2">
              <img 
                src="https://www.genspark.ai/api/files/s/A7LiItwb" 
                alt="Reliable Group Logo" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-500 text-xs">Work Permit Management System</p>
          </div>

          {/* Register card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-5 sm:p-6">
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <UserPlus className="w-5 h-5 text-[#1e3a6e]" />
                <h2 className="text-xl font-bold text-gray-900">Create account</h2>
              </div>
              <p className="text-gray-500 text-sm">Register as a new requestor</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
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

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#1e3a6e] transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#1e3a6e] focus:ring-2 focus:ring-[#1e3a6e]/20 transition-all duration-200 outline-none text-sm"
                    placeholder="john.doe@company.com"
                    required
                  />
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
                    placeholder="Operations"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Confirm Password</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#1e3a6e] to-[#2a4a80] hover:from-[#162d57] hover:to-[#1e3a6e] text-white font-semibold rounded-xl shadow-lg shadow-[#1e3a6e]/25 hover:shadow-xl hover:shadow-[#1e3a6e]/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
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
          <p className="text-center text-gray-400 text-xs mt-4 lg:hidden">
            © 2025 YP SECURITY SERVICES PVT LTD
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
