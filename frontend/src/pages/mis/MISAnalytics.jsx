import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Droplets,
  Flame,
  Radio,
  Thermometer,
  Gauge,
  PieChart,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Layers,
  LayoutDashboard,
  Settings,
  Eye,
  Maximize2,
  Minimize2,
  MoreVertical,
  FileText,
  Users,
  Building,
  MapPin,
  Camera,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Meter type configs with enhanced styling
const meterConfigs = {
  electricity: { icon: Zap, color: '#EAB308', bgColor: 'rgba(234, 179, 8, 0.1)', label: 'Electricity', unit: 'kWh' },
  water: { icon: Droplets, color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)', label: 'Water', unit: 'm³' },
  gas: { icon: Flame, color: '#F97316', bgColor: 'rgba(249, 115, 22, 0.1)', label: 'Gas', unit: 'm³' },
  transmitter: { icon: Radio, color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.1)', label: 'Transmitter', unit: 'dB' },
  temperature: { icon: Thermometer, color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)', label: 'Temperature', unit: '°C' },
  pressure: { icon: Gauge, color: '#8B5CF6', bgColor: 'rgba(139, 92, 246, 0.1)', label: 'Pressure', unit: 'bar' },
  fuel: { icon: Gauge, color: '#EC4899', bgColor: 'rgba(236, 72, 153, 0.1)', label: 'Fuel', unit: 'L' },
  flow: { icon: Activity, color: '#06B6D4', bgColor: 'rgba(6, 182, 212, 0.1)', label: 'Flow', unit: 'L/min' },
}

// Color palette for charts
const chartColors = [
  '#8B5CF6', '#3B82F6', '#22C55E', '#EAB308', '#F97316', '#EF4444', '#EC4899', '#06B6D4',
  '#6366F1', '#14B8A6', '#F59E0B', '#84CC16', '#A855F7', '#0EA5E9', '#F43F5E', '#10B981'
]

// Animated number component
const AnimatedNumber = ({ value, decimals = 0, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value])
  
  return (
    <span>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  )
}

// Sparkline mini chart
const Sparkline = ({ data, color = '#8B5CF6', height = 40 }) => {
  if (!data || data.length === 0) return null
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100
    const y = height - ((val - min) / range) * (height - 4)
    return `${x},${y}`
  }).join(' ')
  
  const areaPoints = `0,${height} ${points} 100,${height}`
  
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#gradient-${color.replace('#', '')})`}
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

// Donut Chart Component
const DonutChart = ({ data, size = 200, strokeWidth = 24 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  
  let currentAngle = -90
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, idx) => {
          const percentage = item.value / total
          const strokeDasharray = `${percentage * circumference} ${circumference}`
          const strokeDashoffset = 0
          const rotation = currentAngle
          currentAngle += percentage * 360
          
          return (
            <circle
              key={idx}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'stroke-dasharray 0.5s ease'
              }}
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-900">{total}</span>
        <span className="text-sm text-gray-500">Total</span>
      </div>
    </div>
  )
}

// Bar Chart Component
const BarChart = ({ data, height = 200, showLabels = true, horizontal = false }) => {
  if (!data || data.length === 0) return null
  
  const maxValue = Math.max(...data.map(d => d.value))
  
  if (horizontal) {
    return (
      <div className="space-y-3">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 truncate">{item.label}</div>
            <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
              <div
                className="h-full rounded-lg transition-all duration-500 ease-out flex items-center"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || chartColors[idx % chartColors.length]
                }}
              >
                <span className="text-white text-xs font-medium px-2 whitespace-nowrap">
                  {item.value.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-end gap-1" style={{ height }}>
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center justify-end group"
          >
            <div className="relative w-full">
              <div
                className="w-full rounded-t-lg transition-all duration-500 ease-out hover:opacity-80 cursor-pointer"
                style={{
                  height: `${(item.value / maxValue) * height}px`,
                  minHeight: item.value > 0 ? '4px' : '0',
                  background: `linear-gradient(180deg, ${item.color || chartColors[idx % chartColors.length]}, ${item.color || chartColors[idx % chartColors.length]}dd)`
                }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                {item.label}: {item.value.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-1 mt-2 border-t border-gray-100 pt-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex-1 text-center">
              <span className="text-[10px] text-gray-500 truncate block">{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Line/Area Chart Component
const AreaChart = ({ data, height = 200, color = '#8B5CF6', showGrid = true, showDots = false }) => {
  if (!data || data.length === 0) return null
  
  const maxValue = Math.max(...data.map(d => d.value))
  const minValue = Math.min(...data.map(d => d.value))
  const range = maxValue - minValue || 1
  const padding = 20
  
  const points = data.map((item, idx) => {
    const x = padding + (idx / (data.length - 1)) * (100 - padding * 2)
    const y = padding + (1 - (item.value - minValue) / range) * (height - padding * 2)
    return { x, y, ...item }
  })
  
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `M ${points[0].x} ${height - padding} ${linePath} L ${points[points.length - 1].x} ${height - padding} Z`
  
  return (
    <div className="relative" style={{ height }}>
      <svg viewBox={`0 0 100 ${height}`} className="w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Grid lines */}
        {showGrid && [0, 25, 50, 75, 100].map(y => (
          <line
            key={y}
            x1={padding}
            y1={padding + (y / 100) * (height - padding * 2)}
            x2={100 - padding}
            y2={padding + (y / 100) * (height - padding * 2)}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />
        
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Dots */}
        {showDots && points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="3"
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
        ))}
      </svg>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-gray-400 py-4">
        <span>{maxValue.toFixed(0)}</span>
        <span>{((maxValue + minValue) / 2).toFixed(0)}</span>
        <span>{minValue.toFixed(0)}</span>
      </div>
    </div>
  )
}

// Gauge Chart Component
const GaugeChart = ({ value, max = 100, color = '#8B5CF6', label = '', size = 120 }) => {
  const percentage = Math.min((value / max) * 100, 100)
  const angle = (percentage / 100) * 180
  const radius = size / 2 - 10
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg viewBox={`0 0 ${size} ${size / 2 + 20}`} className="w-full h-full">
          {/* Background arc */}
          <path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Value arc */}
          <path
            d={`M 10 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2}`}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * Math.PI * radius} ${Math.PI * radius}`}
          />
          {/* Needle */}
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size / 2 + Math.cos((angle - 180) * Math.PI / 180) * (radius - 15)}
            y2={size / 2 + Math.sin((angle - 180) * Math.PI / 180) * (radius - 15)}
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={size / 2} cy={size / 2} r="5" fill="#374151" />
        </svg>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <div className="text-2xl font-bold text-gray-900">{value.toFixed(1)}</div>
          <div className="text-xs text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  )
}

// KPI Card Component
const KPICard = ({ title, value, change, changeType = 'neutral', icon: Icon, color, prefix = '', suffix = '', sparklineData }) => {
  const changeColors = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  }
  
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${changeColors[changeType]}`}>
            {changeType === 'positive' ? (
              <TrendingUp className="w-3 h-3" />
            ) : changeType === 'negative' ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {change > 0 ? '+' : ''}{change}%
          </div>
        )}
      </div>
      
      <div className="mb-2">
        <h3 className="text-3xl font-bold text-gray-900">
          <AnimatedNumber value={value} decimals={value % 1 !== 0 ? 1 : 0} prefix={prefix} suffix={suffix} />
        </h3>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
      </div>
      
      {sparklineData && sparklineData.length > 0 && (
        <div className="h-10 mt-3">
          <Sparkline data={sparklineData} color={color} />
        </div>
      )}
    </div>
  )
}

// Dashboard Widget Card
const WidgetCard = ({ title, subtitle, icon: Icon, children, actions, className = '', expandable = false }) => {
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between p-5 border-b border-gray-50">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-purple-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {expandable && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  )
}

const MISAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [meterType, setMeterType] = useState('')
  const [viewMode, setViewMode] = useState('dashboard') // dashboard, detailed, comparison
  const [selectedMeters, setSelectedMeters] = useState([])
  const [showExportMenu, setShowExportMenu] = useState(false)

  useEffect(() => {
    fetchAnalytics()
  }, [period, meterType])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ period })
      if (meterType) params.append('meterType', meterType)

      const response = await axios.get(`${API_URL}/meters/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setAnalytics(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set empty state data when API fails or no data
      setAnalytics({
        stats: {
          totalReadings: 0,
          totalConsumption: 0,
          avgConsumption: 0,
          maxReading: 0,
          minReading: 0,
          verifiedCount: 0,
          pendingVerification: 0
        },
        byMeterType: {},
        chartData: [],
        byLocation: {},
        alerts: [],
        recentReadings: []
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ format: format === 'xlsx' ? 'csv' : format })
      if (meterType) params.append('meterType', meterType)

      const response = await axios.get(`${API_URL}/meters/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: format === 'json' ? 'json' : 'blob',
      })

      const filename = `mis_analytics_${period}_${new Date().toISOString().split('T')[0]}`
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('CSV exported successfully!')
      } else if (format === 'xlsx') {
        // Add BOM for Excel compatibility
        const BOM = '\uFEFF'
        const csvText = await response.data.text()
        const blob = new Blob([BOM + csvText], { type: 'application/vnd.ms-excel;charset=utf-8' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('Excel file exported successfully!')
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${filename}.json`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('JSON exported successfully!')
      }
    } catch (error) {
      console.error('Export error:', error)
      // If no data, show friendly message
      if (error.response?.status === 404 || !analytics?.stats?.totalReadings) {
        toast.error('No data available to export')
      } else {
        toast.error('Error exporting data')
      }
    }
  }

  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ]

  // Processed data for charts
  const meterTypeData = useMemo(() => {
    if (!analytics?.byMeterType) return []
    return Object.entries(analytics.byMeterType).map(([type, data], idx) => ({
      type,
      label: meterConfigs[type]?.label || type,
      value: data.count,
      consumption: data.totalConsumption,
      color: meterConfigs[type]?.color || chartColors[idx],
      icon: meterConfigs[type]?.icon || Gauge
    }))
  }, [analytics])

  const chartData = useMemo(() => {
    if (!analytics?.chartData) return []
    return analytics.chartData.map(d => ({
      label: new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: d.totalConsumption,
      count: d.count
    }))
  }, [analytics])

  const locationData = useMemo(() => {
    if (!analytics?.byLocation) return []
    return Object.entries(analytics.byLocation).map(([loc, data], idx) => ({
      label: loc,
      value: data.consumption,
      count: data.count,
      color: chartColors[idx]
    }))
  }, [analytics])

  const sparklineData = useMemo(() => {
    if (!analytics?.chartData) return []
    return analytics.chartData.slice(-14).map(d => d.totalConsumption)
  }, [analytics])

  // Calculate change percentages
  const calculateChange = (current, previous) => {
    if (!previous) return 0
    return ((current - previous) / previous * 100).toFixed(1)
  }

  const verificationRate = analytics?.stats 
    ? ((analytics.stats.verifiedCount / analytics.stats.totalReadings) * 100).toFixed(1) 
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Check if there's no data
  const hasNoData = !analytics?.stats?.totalReadings || analytics.stats.totalReadings === 0

  if (hasNoData) {
    return (
      <div className="space-y-6 animate-fade-in pb-8">
        {/* Header Banner - Even with no data */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 20L20 0l20 20-20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Analytics & Reports</h1>
                  <p className="text-blue-100">Real-time insights and consumption analytics</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="px-4 py-2.5 bg-white/20 border border-white/30 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-white/50"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value} className="text-gray-900">{p.label}</option>
                ))}
              </select>
              <button
                onClick={fetchAnalytics}
                className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-6">
              <BarChart3 className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Start uploading meter readings to see analytics and insights. Your data will be visualized here with charts, trends, and consumption patterns.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/mis/readings"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                <FileText className="w-5 h-5" />
                Upload First Reading
              </Link>
              <button
                onClick={fetchAnalytics}
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Data
              </button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gray-50 border-t border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Tips</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upload Photos</p>
                  <p className="text-xs text-gray-500">Use AI OCR to automatically extract meter readings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Verify Readings</p>
                  <p className="text-xs text-gray-500">Ensure data accuracy by verifying submitted readings</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Export Reports</p>
                  <p className="text-xs text-gray-500">Download data as Excel, CSV or JSON</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      {/* Analytics Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 20L20 0l20 20-20 20z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Analytics & Reports</h1>
                <p className="text-blue-100">Real-time insights and consumption analytics</p>
              </div>
            </div>
          </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2.5 bg-white/20 border border-white/30 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-white/50"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value} className="text-gray-900">{p.label}</option>
            ))}
          </select>

          {/* Meter Type Filter */}
          <select
            value={meterType}
            onChange={(e) => setMeterType(e.target.value)}
            className="px-4 py-2.5 bg-white/20 border border-white/30 rounded-xl text-white text-sm font-medium focus:ring-2 focus:ring-white/50"
          >
            <option value="" className="text-gray-900">All Meter Types</option>
            {Object.entries(meterConfigs).map(([key, config]) => (
              <option key={key} value={key} className="text-gray-900">{config.label}</option>
            ))}
          </select>

          {/* Export Dropdown - Click to toggle */}
          <div className="relative">
            <button 
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors text-sm font-medium shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </button>
            {showExportMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase">Export Analytics Data</p>
                  </div>
                  <button
                    onClick={() => { handleExport('xlsx'); setShowExportMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 text-green-600" />
                    Export as Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => { handleExport('csv'); setShowExportMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => { handleExport('json'); setShowExportMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 text-purple-600" />
                    Export as JSON
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={fetchAnalytics}
            className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-gray-100 rounded-xl p-1">
          {[
            { value: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
            { value: 'detailed', icon: BarChart3, label: 'Detailed Charts' },
          ].map(mode => (
            <button
              key={mode.value}
              onClick={() => setViewMode(mode.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === mode.value
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          Showing data for: <span className="font-medium text-gray-700">{periods.find(p => p.value === period)?.label}</span>
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Readings"
          value={analytics?.stats?.totalReadings || 0}
          change={12.5}
          changeType="positive"
          icon={FileText}
          color="#3B82F6"
          sparklineData={sparklineData}
        />
        <KPICard
          title="Total Consumption"
          value={analytics?.stats?.totalConsumption || 0}
          change={8.2}
          changeType="positive"
          icon={Activity}
          color="#8B5CF6"
          sparklineData={sparklineData}
        />
        <KPICard
          title="Verified Readings"
          value={analytics?.stats?.verifiedCount || 0}
          suffix={`/${analytics?.stats?.totalReadings || 0}`}
          icon={CheckCircle}
          color="#22C55E"
        />
        <KPICard
          title="Pending Verification"
          value={analytics?.stats?.pendingVerification || 0}
          changeType={analytics?.stats?.pendingVerification > 10 ? 'negative' : 'neutral'}
          icon={Clock}
          color="#F97316"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Consumption Trend Chart */}
        <WidgetCard
          title="Consumption Trend"
          subtitle={`${period === '7d' ? 'Daily' : period === '30d' ? 'Daily' : 'Weekly'} consumption over time`}
          icon={TrendingUp}
          className="lg:col-span-2"
        >
          <div className="h-64">
            {chartData.length > 0 ? (
              <AreaChart
                data={chartData}
                height={240}
                color="#8B5CF6"
                showGrid={true}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No data available</p>
              </div>
            )}
          </div>
          
          {/* Chart Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm text-gray-600">Consumption</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Avg:</span>
              <span className="font-medium text-gray-900">{analytics?.stats?.avgConsumption?.toFixed(2) || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Max:</span>
              <span className="font-medium text-gray-900">{analytics?.stats?.maxReading?.toFixed(1) || 0}</span>
            </div>
          </div>
        </WidgetCard>

        {/* Meter Type Distribution - Donut */}
        <WidgetCard
          title="Distribution by Type"
          subtitle="Readings per meter type"
          icon={PieChart}
        >
          <div className="flex flex-col items-center">
            {meterTypeData.length > 0 ? (
              <>
                <DonutChart
                  data={meterTypeData.map(d => ({ value: d.value, color: d.color }))}
                  size={180}
                  strokeWidth={20}
                />
                <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                  {meterTypeData.slice(0, 6).map((item, idx) => {
                    const Icon = item.icon
                    return (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-600 truncate">{item.label}</span>
                        <span className="text-gray-400 ml-auto">{item.value}</span>
                      </div>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-gray-400">
                <p>No data available</p>
              </div>
            )}
          </div>
        </WidgetCard>
      </div>

      {/* Second Row - More Details */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Consumption by Meter Type - Horizontal Bars */}
        <WidgetCard
          title="Consumption by Type"
          subtitle="Total consumption per meter category"
          icon={BarChart3}
        >
          {meterTypeData.length > 0 ? (
            <BarChart
              data={meterTypeData.map(d => ({
                label: d.label,
                value: d.consumption,
                color: d.color
              }))}
              horizontal={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>No data available</p>
            </div>
          )}
        </WidgetCard>

        {/* Consumption by Location */}
        <WidgetCard
          title="Consumption by Location"
          subtitle="Distribution across buildings"
          icon={MapPin}
        >
          {locationData.length > 0 ? (
            <BarChart
              data={locationData}
              horizontal={true}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              <p>No location data available</p>
            </div>
          )}
        </WidgetCard>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {meterTypeData.map((item, idx) => {
          const Icon = item.icon
          const percentage = analytics?.stats?.totalConsumption 
            ? ((item.consumption / analytics.stats.totalConsumption) * 100).toFixed(1)
            : 0
          
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
              style={{ borderLeftWidth: '4px', borderLeftColor: item.color }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: meterConfigs[item.type]?.bgColor || `${item.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <span className="text-sm text-gray-400">{percentage}%</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-bold text-gray-900">{item.consumption.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">{meterConfigs[item.type]?.unit || 'units'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="w-4 h-4" />
                  <span>{item.value} readings</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Verification Status & Alerts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Verification Status */}
        <WidgetCard
          title="Verification Status"
          subtitle="Reading verification progress"
          icon={CheckCircle}
        >
          <div className="flex items-center justify-around">
            <GaugeChart
              value={parseFloat(verificationRate)}
              max={100}
              color="#22C55E"
              label="Verified %"
              size={150}
            />
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium text-gray-900">{analytics?.stats?.verifiedCount || 0}</p>
                  <p className="text-sm text-gray-500">Verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">{analytics?.stats?.pendingVerification || 0}</p>
                  <p className="text-sm text-gray-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
        </WidgetCard>

        {/* Alerts */}
        <WidgetCard
          title="Consumption Alerts"
          subtitle="Significant changes detected"
          icon={AlertTriangle}
          actions={
            <Link
              to="/mis/readings"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          {analytics?.alerts && analytics.alerts.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    alert.type === 'HIGH_CONSUMPTION' ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    alert.type === 'HIGH_CONSUMPTION' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {alert.type === 'HIGH_CONSUMPTION' ? (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{alert.meterName}</p>
                    <p className="text-sm text-gray-500">{alert.location}</p>
                  </div>
                  <div className={`text-right ${
                    alert.type === 'HIGH_CONSUMPTION' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    <p className="font-mono font-medium">
                      {alert.consumption > 0 ? '+' : ''}{alert.consumption?.toFixed(1)}
                    </p>
                    <p className="text-xs opacity-75">
                      {alert.type === 'HIGH_CONSUMPTION' ? 'High' : 'Low'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <CheckCircle className="w-12 h-12 mb-2 opacity-50" />
              <p>No alerts detected</p>
              <p className="text-sm">All readings are within normal range</p>
            </div>
          )}
        </WidgetCard>
      </div>

      {/* Summary Table */}
      <WidgetCard
        title="Detailed Summary"
        subtitle="Complete breakdown by meter type"
        icon={Layers}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Meter Type</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Readings</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Consumption</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg/Reading</th>
                <th className="text-right py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Share</th>
                <th className="py-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Distribution</th>
              </tr>
            </thead>
            <tbody>
              {meterTypeData.map((item, idx) => {
                const Icon = item.icon
                const totalConsumption = analytics?.stats?.totalConsumption || 1
                const percentage = ((item.consumption / totalConsumption) * 100).toFixed(1)
                const avgPerReading = item.value > 0 ? (item.consumption / item.value).toFixed(2) : 0

                return (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: meterConfigs[item.type]?.bgColor || `${item.color}15` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{item.label}</span>
                          <span className="text-xs text-gray-400 ml-2">{meterConfigs[item.type]?.unit || 'units'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono font-medium text-gray-900">{item.value}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono font-bold text-gray-900">{item.consumption.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-mono text-gray-600">{avgPerReading}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-medium text-gray-900">{percentage}%</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%`, backgroundColor: item.color }}
                        />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-medium">
                <td className="py-4 px-4 text-gray-900">Total</td>
                <td className="py-4 px-4 text-right font-mono">{analytics?.stats?.totalReadings || 0}</td>
                <td className="py-4 px-4 text-right font-mono font-bold text-purple-600">{analytics?.stats?.totalConsumption?.toFixed(2) || 0}</td>
                <td className="py-4 px-4 text-right font-mono">{analytics?.stats?.avgConsumption?.toFixed(2) || 0}</td>
                <td className="py-4 px-4 text-right">100%</td>
                <td className="py-4 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </WidgetCard>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span>•</span>
          <span>Period: {periods.find(p => p.value === period)?.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Data refreshes automatically</span>
          <RefreshCw className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

export default MISAnalytics
