import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight
} from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  // Load saved credentials on mount
  useEffect(() => {
    setMounted(true)
    const savedCredentials = localStorage.getItem('savedLogin')
    if (savedCredentials) {
      try {
        const { email, password } = JSON.parse(savedCredentials)
        setFormData({ email: email || '', password: password || '' })
        setRememberMe(true)
      } catch (e) {
        localStorage.removeItem('savedLogin')
      }
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      
      // Save or remove credentials based on checkbox
      if (rememberMe) {
        localStorage.setItem('savedLogin', JSON.stringify({
          email: formData.email,
          password: formData.password,
        }))
      } else {
        localStorage.removeItem('savedLogin')
      }
      
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
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-[#0a0a0a]">
      {/* Left Panel - Branding with illustrative style */}
      <div className="hidden lg:flex lg:w-[45%] relative">
        {/* Animated SVG background pattern */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Grid lines - hand-drawn style */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="2,3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Decorative animated circles */}
          <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute top-24 left-24 w-24 h-24 border border-dashed border-white/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
          <div className="absolute bottom-32 right-20 w-40 h-40 border border-white/10 rounded-full animate-[spin_25s_linear_infinite]" />
          
          {/* Decorative lines */}
          <svg className="absolute bottom-0 left-0 w-full h-48 opacity-30" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M0,50 Q100,20 200,50 T400,50" fill="none" stroke="white" strokeWidth="1" className="animate-pulse" />
            <path d="M0,70 Q100,40 200,70 T400,70" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="5,5" />
          </svg>
        </div>
        
        {/* Content */}
        <div className={`relative z-10 flex flex-col justify-center items-center w-full px-10 xl:px-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
          {/* Logo with hand-drawn border effect */}
          <div className="mb-10 relative">
            <div className="absolute -inset-3 border-2 border-dashed border-white/40 rounded-3xl animate-pulse" />
            <div className="bg-white rounded-2xl p-6 relative shadow-2xl shadow-white/10">
              <img 
                src="/logo.png" 
                alt="Reliable Group Logo" 
                className="h-32 w-auto"
              />
            </div>
          </div>

          {/* Title with typewriter effect style */}
          <div className="text-center">
            <h2 className="text-3xl xl:text-4xl font-light text-white tracking-wider">
              Reliable Group <span className="text-red-400 animate-pulse">|</span> MEP
            </h2>
            <p className="text-white/50 text-sm mt-3 tracking-widest uppercase">Work Permit Management</p>
          </div>

          {/* Decorative illustration */}
          <div className="mt-12 relative">
            <svg width="200" height="80" viewBox="0 0 200 80" className="text-white/30">
              {/* Animated gears */}
              <g className="animate-[spin_4s_linear_infinite] origin-center" style={{ transformOrigin: '30px 40px' }}>
                <circle cx="30" cy="40" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="30" cy="40" r="10" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" />
              </g>
              <g className="animate-[spin_3s_linear_infinite_reverse] origin-center" style={{ transformOrigin: '60px 40px' }}>
                <circle cx="60" cy="40" r="12" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="60" cy="40" r="7" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2,2" />
              </g>
              {/* Connecting line */}
              <path d="M75,40 L120,40" stroke="currentColor" strokeWidth="1" strokeDasharray="5,3" />
              {/* Arrow */}
              <path d="M120,40 L140,40 M135,35 L140,40 L135,45" stroke="currentColor" strokeWidth="1.5" fill="none" />
              {/* Document icon */}
              <rect x="150" y="25" width="30" height="35" rx="2" fill="none" stroke="currentColor" strokeWidth="1" />
              <line x1="156" y1="35" x2="174" y2="35" stroke="currentColor" strokeWidth="1" />
              <line x1="156" y1="42" x2="174" y2="42" stroke="currentColor" strokeWidth="1" />
              <line x1="156" y1="49" x2="168" y2="49" stroke="currentColor" strokeWidth="1" />
            </svg>
          </div>

          {/* Copyright */}
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <p className="text-white/40 text-xs tracking-wider">
              © 2025 YP SECURITY SERVICES PVT LTD
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form with illustrative style */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-4 sm:p-6 bg-[#0a0a0a] relative">
        {/* Subtle corner decorations */}
        <div className="absolute top-8 right-8 w-20 h-20 border-t border-r border-white/10" />
        <div className="absolute bottom-8 left-8 w-20 h-20 border-b border-l border-white/10" />
        
        <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-block bg-white rounded-xl p-3 shadow-lg mb-3">
              <img 
                src="/logo.png" 
                alt="Reliable Group Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h2 className="text-lg font-light text-white tracking-wider">Reliable Group <span className="text-red-400">|</span> MEP</h2>
          </div>

          {/* Login card - illustrative style */}
          <div className="relative">
            {/* Hand-drawn border effect */}
            <div className="absolute -inset-1 border border-dashed border-white/20 rounded-3xl" />
            
            <div className="bg-[#111111] rounded-2xl p-8 relative border border-white/10">
              {/* Corner accents */}
              <div className="absolute top-0 left-6 w-12 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              <div className="absolute bottom-0 right-6 w-12 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
              
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-light text-white tracking-wide mb-2">Welcome back</h2>
                <p className="text-white/50 text-sm">Sign in to continue</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email field - illustrative style */}
                <div className="relative">
                  <label className="block text-xs font-medium text-white/70 mb-2 tracking-wider uppercase">Email</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-0 border ${focusedField === 'email' ? 'border-white/50' : 'border-white/20'} rounded-xl transition-colors duration-300`} />
                    <div className={`absolute left-0 top-0 bottom-0 w-12 border-r ${focusedField === 'email' ? 'border-white/50' : 'border-white/20'} rounded-l-xl flex items-center justify-center transition-colors duration-300`}>
                      <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-white' : 'text-white/40'}`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-16 pr-4 py-4 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm rounded-xl"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                {/* Password field - illustrative style */}
                <div className="relative">
                  <label className="block text-xs font-medium text-white/70 mb-2 tracking-wider uppercase">Password</label>
                  <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                    <div className={`absolute inset-0 border ${focusedField === 'password' ? 'border-white/50' : 'border-white/20'} rounded-xl transition-colors duration-300`} />
                    <div className={`absolute left-0 top-0 bottom-0 w-12 border-r ${focusedField === 'password' ? 'border-white/50' : 'border-white/20'} rounded-l-xl flex items-center justify-center transition-colors duration-300`}>
                      <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-white' : 'text-white/40'}`} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full pl-16 pr-12 py-4 bg-transparent text-white placeholder-white/30 focus:outline-none text-sm rounded-xl"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me - Creative checkbox with animation */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      {/* Animated checkbox */}
                      <div className={`w-6 h-6 border-2 rounded-lg transition-all duration-500 relative overflow-hidden ${
                        rememberMe ? 'border-white bg-white' : 'border-white/30 group-hover:border-white/50'
                      }`}>
                        {/* Checkmark with animation */}
                        <svg
                          className={`absolute inset-0 w-full h-full p-1 transition-all duration-300 ${
                            rememberMe ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                          }`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#0a0a0a"
                          strokeWidth={3}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" className={rememberMe ? 'animate-[draw_0.3s_ease-out_forwards]' : ''} 
                            style={{ strokeDasharray: 20, strokeDashoffset: rememberMe ? 0 : 20 }} />
                        </svg>
                      </div>
                      {/* Ripple effect */}
                      {rememberMe && (
                        <div className="absolute inset-0 rounded-lg border-2 border-white animate-ping opacity-50" />
                      )}
                    </div>
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                      Remember me
                    </span>
                  </label>
                </div>

                {/* Submit button - illustrative style */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 relative group overflow-hidden rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {/* Button background with animated border */}
                  <div className="absolute inset-0 bg-white rounded-xl" />
                  <div className="absolute inset-0 border-2 border-white rounded-xl group-hover:border-dashed transition-all duration-300" />
                  
                  {/* Animated corner accents on hover */}
                  <div className="absolute top-0 left-0 w-0 h-0 border-t-2 border-l-2 border-[#0a0a0a] group-hover:w-4 group-hover:h-4 transition-all duration-300" />
                  <div className="absolute bottom-0 right-0 w-0 h-0 border-b-2 border-r-2 border-[#0a0a0a] group-hover:w-4 group-hover:h-4 transition-all duration-300" />
                  
                  <span className="relative flex items-center justify-center gap-2 text-[#0a0a0a] font-semibold text-sm">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </button>
              </form>

              {/* Divider with decorative style */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dashed border-white/20" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-[#111111] text-white/40 text-xs tracking-wider">NEW HERE?</span>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors group"
                >
                  <span>Create an account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Copyright - Mobile */}
          <p className="text-center text-white/30 text-xs mt-6 lg:hidden tracking-wider">
            © 2025 YP SECURITY SERVICES PVT LTD
          </p>
        </div>
      </div>
      
      {/* Custom keyframes for animations */}
      <style>{`
        @keyframes draw {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default Login
