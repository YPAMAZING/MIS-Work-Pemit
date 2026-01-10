import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  UserCog, 
  HardHat, 
  ClipboardCheck,
  Wrench,
  CheckCircle2
} from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedDemo, setSelectedDemo] = useState(null)
  const [mounted, setMounted] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setSelectedDemo(null)
  }

  // Demo credentials with icons and colors
  const demoAccounts = [
    { 
      role: 'Admin', 
      email: 'admin@permitmanager.com', 
      password: 'admin123',
      icon: UserCog,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-50 hover:bg-violet-100',
      textColor: 'text-violet-600'
    },
    { 
      role: 'Safety', 
      email: 'safety@permitmanager.com', 
      password: 'safety123',
      icon: HardHat,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-600'
    },
    { 
      role: 'Requestor', 
      email: 'requestor@permitmanager.com', 
      password: 'user123',
      icon: ClipboardCheck,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100',
      textColor: 'text-emerald-600'
    },
    { 
      role: 'Engineer', 
      email: 'engineer@permitmanager.com', 
      password: 'engineer123',
      icon: Wrench,
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      textColor: 'text-orange-600'
    },
  ]

  const fillDemoCredentials = (account) => {
    setFormData({ email: account.email, password: account.password })
    setSelectedDemo(account.email)
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Content */}
        <div className={`relative z-10 flex flex-col justify-center px-10 xl:px-16 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          {/* Logo */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">MIS</h1>
                <p className="text-slate-400 text-sm">Work Permit System</p>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-8">
            <h2 className="text-2xl xl:text-3xl font-bold text-white leading-tight mb-3">
              Streamline Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
                Safety Workflows
              </span>
            </h2>
            <p className="text-slate-400 text-sm max-w-sm">
              Comprehensive permit management with digital approvals and real-time tracking.
            </p>
          </div>

          {/* Features - Compact */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {['Permit Management', 'Digital Approvals', 'OCR Processing', 'Analytics'].map((feature, index) => (
              <div 
                key={feature}
                className="flex items-center gap-2 text-slate-300 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Company badge */}
          <div className="pt-6 border-t border-slate-700/50">
            <p className="text-slate-500 text-xs">Powered by</p>
            <p className="text-slate-300 font-semibold text-sm mt-1">
              YP SECURITY SERVICES PVT LTD
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-4 sm:p-6 bg-gray-50">
        <div className={`w-full max-w-md transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">MIS</h1>
                <p className="text-gray-500 text-xs">Work Permit System</p>
              </div>
            </div>
          </div>

          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 outline-none text-sm"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 outline-none text-sm"
                    placeholder="Enter your password"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo credentials - Compact */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center mb-3">Demo Accounts (click to fill)</p>
              <div className="grid grid-cols-4 gap-2">
                {demoAccounts.map((account) => {
                  const Icon = account.icon
                  const isSelected = selectedDemo === account.email
                  return (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => fillDemoCredentials(account)}
                      className={`relative p-2 rounded-lg border transition-all duration-200 ${
                        isSelected 
                          ? `border-transparent bg-gradient-to-r ${account.color} shadow-md` 
                          : `border-gray-100 ${account.bgColor}`
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : account.textColor}`} />
                        <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                          {account.role}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
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

export default Login
