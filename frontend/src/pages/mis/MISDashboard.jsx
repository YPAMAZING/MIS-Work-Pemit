import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  LayoutDashboard,
  BarChart3,
  Camera,
  FileText,
  TrendingUp,
  TrendingDown,
  Calendar,
  Bell,
  Zap,
  Droplets,
  Flame,
  Radio,
  Thermometer,
  Gauge,
  CheckCircle,
  Clock,
  AlertTriangle,
  Activity,
  ArrowRight,
  Plus,
  RefreshCw,
  Download,
  Eye,
  Target,
  Users,
  Building,
  Settings,
  ChevronRight,
  Sparkles,
  Shield,
  CircleDot,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Meter type icons and colors
const meterIcons = {
  electricity: { icon: Zap, color: '#EAB308', bgColor: 'bg-yellow-50', textColor: 'text-yellow-600', gradient: 'from-yellow-400 to-amber-500' },
  water: { icon: Droplets, color: '#3B82F6', bgColor: 'bg-blue-50', textColor: 'text-blue-600', gradient: 'from-blue-400 to-cyan-500' },
  gas: { icon: Flame, color: '#F97316', bgColor: 'bg-orange-50', textColor: 'text-orange-600', gradient: 'from-orange-400 to-red-500' },
  transmitter: { icon: Radio, color: '#22C55E', bgColor: 'bg-green-50', textColor: 'text-green-600', gradient: 'from-green-400 to-emerald-500' },
  temperature: { icon: Thermometer, color: '#EF4444', bgColor: 'bg-red-50', textColor: 'text-red-600', gradient: 'from-red-400 to-rose-500' },
  pressure: { icon: Gauge, color: '#8B5CF6', bgColor: 'bg-purple-50', textColor: 'text-purple-600', gradient: 'from-purple-400 to-violet-500' },
  fuel: { icon: Gauge, color: '#EC4899', bgColor: 'bg-pink-50', textColor: 'text-pink-600', gradient: 'from-pink-400 to-rose-500' },
  flow: { icon: Activity, color: '#06B6D4', bgColor: 'bg-cyan-50', textColor: 'text-cyan-600', gradient: 'from-cyan-400 to-teal-500' },
}

// Animated counter component
const AnimatedCounter = ({ value, duration = 1000, decimals = 0 }) => {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let start = 0
    const end = parseFloat(value) || 0
    const incrementTime = duration / 60
    const increment = end / 60
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, incrementTime)
    
    return () => clearInterval(timer)
  }, [value, duration])
  
  return <span>{count.toFixed(decimals)}</span>
}

// Mini sparkline chart
const MiniSparkline = ({ data, color = '#8B5CF6', height = 32 }) => {
  if (!data || data.length === 0) return null
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100
    const y = height - 2 - ((val - min) / range) * (height - 4)
    return `${x},${y}`
  }).join(' ')
  
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Progress ring component
const ProgressRing = ({ progress, size = 80, strokeWidth = 6, color = '#8B5CF6' }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

// Stat card component
const StatCard = ({ title, value, icon: Icon, color, change, changeType, suffix = '', sparkData }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            changeType === 'up' ? 'bg-green-100 text-green-700' : 
            changeType === 'down' ? 'bg-red-100 text-red-700' : 
            'bg-gray-100 text-gray-700'
          }`}>
            {changeType === 'up' ? <TrendingUp className="w-3 h-3" /> : 
             changeType === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
            {change}%
          </div>
        )}
      </div>
      
      <h3 className="text-3xl font-bold text-gray-900 mb-1">
        <AnimatedCounter value={value} decimals={value % 1 !== 0 ? 1 : 0} />
        {suffix && <span className="text-lg text-gray-400 ml-1">{suffix}</span>}
      </h3>
      <p className="text-sm text-gray-500">{title}</p>
      
      {sparkData && sparkData.length > 0 && (
        <div className="mt-3 h-8">
          <MiniSparkline data={sparkData} color={color.includes('purple') ? '#8B5CF6' : '#3B82F6'} />
        </div>
      )}
    </div>
  )
}

const MISDashboard = () => {
  const navigate = useNavigate()
  const { user, isAdmin, canVerifyMeterReadings } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true)
      else setLoading(true)

      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/meters/analytics?period=30d`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set empty state data when API fails - no fake data
      setAnalytics({
        stats: {
          totalReadings: 0,
          totalConsumption: 0,
          avgConsumption: 0,
          maxReading: 0,
          verifiedCount: 0,
          pendingVerification: 0
        },
        byMeterType: {},
        chartData: [],
        alerts: [],
        recentReadings: []
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const stats = useMemo(() => {
    if (!analytics) return []
    return [
      { 
        label: 'Total Readings', 
        value: analytics.stats?.totalReadings || 0, 
        icon: FileText, 
        color: 'from-blue-500 to-cyan-500',
        change: 12,
        changeType: 'up'
      },
      { 
        label: 'Total Consumption', 
        value: analytics.stats?.totalConsumption || 0, 
        icon: Activity, 
        color: 'from-purple-500 to-pink-500',
        change: 8,
        changeType: 'up'
      },
      { 
        label: 'Verified', 
        value: analytics.stats?.verifiedCount || 0, 
        icon: CheckCircle, 
        color: 'from-green-500 to-emerald-500',
        suffix: `/${analytics.stats?.totalReadings || 0}`
      },
      { 
        label: 'Pending', 
        value: analytics.stats?.pendingVerification || 0, 
        icon: Clock, 
        color: 'from-orange-500 to-red-500',
      },
    ]
  }, [analytics])

  const meterTypeStats = useMemo(() => {
    if (!analytics?.byMeterType) return []
    return Object.entries(analytics.byMeterType).map(([type, data]) => {
      const config = meterIcons[type] || { icon: Gauge, bgColor: 'bg-gray-50', textColor: 'text-gray-600', gradient: 'from-gray-400 to-gray-500' }
      return {
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        count: data.count,
        consumption: data.totalConsumption,
        ...config
      }
    })
  }, [analytics])

  const sparklineData = useMemo(() => {
    if (!analytics?.chartData) return []
    return analytics.chartData.slice(-14).map(d => d.totalConsumption)
  }, [analytics])

  const verificationProgress = analytics?.stats 
    ? Math.round((analytics.stats.verifiedCount / analytics.stats.totalReadings) * 100) || 0
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Check if there's no data
  const hasNoData = !analytics?.stats?.totalReadings || analytics.stats.totalReadings === 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl p-8 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-purple-100 text-sm">Welcome back</p>
                <h1 className="text-2xl lg:text-3xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h1>
              </div>
            </div>
            <p className="text-purple-100 max-w-lg text-sm lg:text-base">
              Monitor and manage meter readings with AI-powered OCR. Upload photos and let the system extract readings automatically.
            </p>
            
            {/* Quick Stats in Hero */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                <FileText className="w-4 h-4" />
                <span className="font-semibold">{analytics?.stats?.totalReadings || 0}</span>
                <span className="text-purple-200 text-sm">readings</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">{verificationProgress}%</span>
                <span className="text-purple-200 text-sm">verified</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/mis/readings"
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Camera className="w-5 h-5" />
              New Reading
            </Link>
          </div>
        </div>
      </div>

      {/* Empty State Banner */}
      {hasNoData && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">No Meter Readings Yet</h3>
                <p className="text-gray-600 text-sm">Start by uploading meter readings or add demo data to explore the dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/mis/readings"
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
              >
                <Camera className="w-4 h-4" />
                Upload Reading
              </Link>
              <Link
                to="/mis/readings"
                className="flex items-center gap-2 px-4 py-2 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Demo Data
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            change={stat.change}
            changeType={stat.changeType}
            suffix={stat.suffix}
            sparkData={idx < 2 ? sparklineData : undefined}
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Meter Types Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Readings by Type</h2>
                <p className="text-sm text-gray-500">Distribution across meter categories</p>
              </div>
            </div>
            <Link to="/mis/analytics" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 group">
              View All 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="p-5">
            {meterTypeStats.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {meterTypeStats.map((meter) => {
                  const Icon = meter.icon
                  const total = analytics?.stats?.totalReadings || 1
                  const percentage = ((meter.count / total) * 100).toFixed(0)
                  
                  return (
                    <div
                      key={meter.type}
                      className={`relative p-4 rounded-2xl ${meter.bgColor} border border-transparent hover:border-gray-200 hover:shadow-md transition-all cursor-pointer group overflow-hidden`}
                      onClick={() => navigate(`/mis/readings?type=${meter.type}`)}
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${meter.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                      
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meter.gradient} flex items-center justify-center shadow-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-400">{percentage}%</span>
                        </div>
                        
                        <h3 className="font-semibold text-gray-900 mb-1">{meter.label}</h3>
                        
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-gray-900">{meter.count}</p>
                            <p className="text-xs text-gray-500">readings</p>
                          </div>
                          {meter.consumption > 0 && (
                            <div className="text-right">
                              <p className={`text-sm font-semibold ${meter.textColor}`}>
                                {meter.consumption.toFixed(1)}
                              </p>
                              <p className="text-xs text-gray-400">consumption</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${meter.gradient} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                <Camera className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium text-gray-500">No readings yet</p>
                <p className="text-sm">Upload your first meter reading to get started</p>
                <Link
                  to="/mis/readings"
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                >
                  Upload Reading
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Verification Progress Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Verification</h3>
                <p className="text-sm text-gray-500">Reading verification status</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <ProgressRing progress={verificationProgress} size={100} strokeWidth={8} color="#22C55E" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-900">{verificationProgress}%</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <p className="text-xl font-bold text-green-600">{analytics?.stats?.verifiedCount || 0}</p>
                <p className="text-xs text-gray-500">Verified</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <p className="text-xl font-bold text-orange-600">{analytics?.stats?.pendingVerification || 0}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
            
            {canVerifyMeterReadings && analytics?.stats?.pendingVerification > 0 && (
              <Link
                to="/mis/readings?status=pending"
                className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Review Pending ({analytics.stats.pendingVerification})
              </Link>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                to="/mis/readings"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl hover:from-purple-100 hover:to-indigo-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Upload Reading</p>
                  <p className="text-xs text-gray-500">OCR auto-extraction</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/mis/analytics"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-xs text-gray-500">Charts & insights</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                to="/mis/export"
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Export Data</p>
                  <p className="text-xs text-gray-500">CSV, JSON formats</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </Link>

              {isAdmin && (
                <Link
                  to="/mis/settings"
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl hover:from-gray-100 hover:to-slate-100 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Settings</p>
                    <p className="text-xs text-gray-500">Users & roles</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {analytics?.alerts && analytics.alerts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Consumption Alerts</h2>
                <p className="text-sm text-gray-500">Significant changes detected</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              {analytics.alerts.length} alerts
            </span>
          </div>
          
          <div className="p-5">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.alerts.slice(0, 6).map((alert, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-l-4 ${
                    alert.type === 'HIGH_CONSUMPTION'
                      ? 'bg-red-50 border-red-500'
                      : 'bg-green-50 border-green-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {alert.type === 'HIGH_CONSUMPTION' ? (
                      <TrendingUp className="w-4 h-4 text-red-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-green-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      alert.type === 'HIGH_CONSUMPTION' ? 'text-red-700' : 'text-green-700'
                    }`}>
                      {alert.type === 'HIGH_CONSUMPTION' ? 'High' : 'Low'} Consumption
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">{alert.meterName}</p>
                  <p className="text-sm text-gray-500">{alert.location}</p>
                  <p className="text-sm font-mono mt-2">
                    Change: <span className={alert.consumption > 0 ? 'text-red-600' : 'text-green-600'}>
                      {alert.consumption > 0 ? '+' : ''}{alert.consumption?.toFixed(2)}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Readings Table */}
      {analytics?.recentReadings && analytics.recentReadings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Recent Readings</h2>
                <p className="text-sm text-gray-500">Latest meter submissions</p>
              </div>
            </div>
            <Link to="/mis/readings" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 group">
              View All
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Meter</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reading</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentReadings.slice(0, 5).map((reading) => {
                  const config = meterIcons[reading.meterType] || { icon: Gauge, bgColor: 'bg-gray-50', textColor: 'text-gray-600', gradient: 'from-gray-400 to-gray-500' }
                  const Icon = config.icon
                  return (
                    <tr key={reading.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reading.meterName}</p>
                            <p className="text-xs text-gray-500">{reading.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                          {reading.meterType}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-medium text-gray-900">
                        {reading.readingValue} {reading.unit}
                      </td>
                      <td className="py-4 px-5">
                        {reading.consumption !== null ? (
                          <span className={`flex items-center gap-1 text-sm font-medium ${reading.consumption > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {reading.consumption > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {reading.consumption > 0 ? '+' : ''}{reading.consumption?.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-500">
                        {new Date(reading.readingDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5">
                        {reading.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CircleDot className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center text-sm text-gray-400 pt-4">
        <p>© {new Date().getFullYear()} MIS Dashboard • YP Security Services Pvt Ltd</p>
      </div>
    </div>
  )
}

export default MISDashboard
