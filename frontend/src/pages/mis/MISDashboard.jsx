import { useState, useEffect } from 'react'
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
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Meter type icons
const meterIcons = {
  electricity: { icon: Zap, color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-600' },
  water: { icon: Droplets, color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  gas: { icon: Flame, color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  transmitter: { icon: Radio, color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-600' },
  temperature: { icon: Thermometer, color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-600' },
  pressure: { icon: Gauge, color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
}

const MISDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
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
      // Don't show error toast on initial load if no data
      if (showRefresh) toast.error('Error refreshing data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const stats = analytics ? [
    { 
      label: 'Total Readings', 
      value: analytics.stats?.totalReadings || 0, 
      icon: FileText, 
      color: 'from-blue-500 to-cyan-500',
      change: null
    },
    { 
      label: 'Total Consumption', 
      value: analytics.stats?.totalConsumption?.toFixed(1) || '0', 
      icon: TrendingUp, 
      color: 'from-purple-500 to-pink-500',
      change: null
    },
    { 
      label: 'Verified', 
      value: analytics.stats?.verifiedCount || 0, 
      icon: CheckCircle, 
      color: 'from-green-500 to-emerald-500',
      change: null
    },
    { 
      label: 'Pending Verification', 
      value: analytics.stats?.pendingVerification || 0, 
      icon: Clock, 
      color: 'from-orange-500 to-red-500',
      change: null
    },
  ] : [
    { label: 'Total Readings', value: '0', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'Total Consumption', value: '0', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    { label: 'Verified', value: '0', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Pending Verification', value: '0', icon: Clock, color: 'from-orange-500 to-red-500' },
  ]

  const getMeterTypeStats = () => {
    if (!analytics?.byMeterType) return []
    return Object.entries(analytics.byMeterType).map(([type, data]) => {
      const config = meterIcons[type] || { icon: Gauge, bgColor: 'bg-gray-100', textColor: 'text-gray-600' }
      return {
        type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        count: data.count,
        consumption: data.totalConsumption,
        ...config
      }
    })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoMnY0aC0yem0tNiAxMGgtMnYtNGgydjR6bTAtNnYtNGgydjRoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-purple-100 max-w-lg">
              Monitor and manage meter readings with AI-powered OCR. 
              Upload photos and let the system extract readings automatically.
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/mis/readings"
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors shadow-lg"
            >
              <Camera className="w-5 h-5" />
              New Reading
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {stat.change && (
                  <span className={`text-sm font-medium ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {loading ? '...' : stat.value}
              </h3>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Meter Types Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Readings by Type</h2>
            <Link to="/mis/analytics" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
          ) : getMeterTypeStats().length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getMeterTypeStats().map((meter) => {
                const Icon = meter.icon
                return (
                  <div
                    key={meter.type}
                    className={`p-4 rounded-xl ${meter.bgColor} border border-opacity-50 hover:shadow-md transition-all cursor-pointer`}
                    onClick={() => navigate(`/mis/readings?type=${meter.type}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-5 h-5 ${meter.textColor}`} />
                      <span className="font-medium text-gray-800">{meter.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{meter.count}</p>
                        <p className="text-xs text-gray-500">readings</p>
                      </div>
                      {meter.consumption > 0 && (
                        <div className="text-right">
                          <p className={`text-sm font-medium ${meter.textColor}`}>
                            {meter.consumption.toFixed(1)}
                          </p>
                          <p className="text-xs text-gray-500">consumption</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Camera className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-center">No readings yet</p>
              <Link to="/mis/readings" className="mt-3 text-purple-600 hover:text-purple-700 text-sm font-medium">
                Upload your first reading
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/mis/readings"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Upload Reading</p>
                  <p className="text-xs text-gray-500">Take photo & extract with OCR</p>
                </div>
              </Link>

              <Link
                to="/mis/analytics"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Analytics</p>
                  <p className="text-xs text-gray-500">Charts & consumption trends</p>
                </div>
              </Link>

              <Link
                to="/mis/export"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Export Data</p>
                  <p className="text-xs text-gray-500">CSV, JSON for Power BI</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Alerts */}
          {analytics?.alerts && analytics.alerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Alerts
              </h2>
              <div className="space-y-3">
                {analytics.alerts.slice(0, 3).map((alert, idx) => (
                  <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <p className="text-sm font-medium text-orange-800">{alert.meterName}</p>
                    <p className="text-xs text-orange-600">
                      {alert.type === 'HIGH_CONSUMPTION' ? 'High consumption detected' : 'Low consumption detected'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Readings */}
      {analytics?.recentReadings && analytics.recentReadings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Readings</h2>
            <Link to="/mis/readings" className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Meter</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Reading</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Consumption</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentReadings.slice(0, 5).map((reading) => {
                  const config = meterIcons[reading.meterType] || { icon: Gauge, bgColor: 'bg-gray-100', textColor: 'text-gray-600' }
                  const Icon = config.icon
                  return (
                    <tr key={reading.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${config.textColor}`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{reading.meterName}</p>
                            <p className="text-xs text-gray-500">{reading.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
                          {reading.meterType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {reading.readingValue} {reading.unit}
                      </td>
                      <td className="py-3 px-4">
                        {reading.consumption !== null ? (
                          <span className={`flex items-center gap-1 text-sm ${reading.consumption > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {reading.consumption > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {reading.consumption > 0 ? '+' : ''}{reading.consumption?.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        {new Date(reading.readingDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {reading.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
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
    </div>
  )
}

export default MISDashboard
