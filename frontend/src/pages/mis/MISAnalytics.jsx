import { useState, useEffect } from 'react'
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
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Meter type configs
const meterConfigs = {
  electricity: { icon: Zap, color: '#EAB308', label: 'Electricity' },
  water: { icon: Droplets, color: '#3B82F6', label: 'Water' },
  gas: { icon: Flame, color: '#F97316', label: 'Gas' },
  transmitter: { icon: Radio, color: '#22C55E', label: 'Transmitter' },
  temperature: { icon: Thermometer, color: '#EF4444', label: 'Temperature' },
  pressure: { icon: Gauge, color: '#8B5CF6', label: 'Pressure' },
  fuel: { icon: Gauge, color: '#EC4899', label: 'Fuel' },
  flow: { icon: Activity, color: '#06B6D4', label: 'Flow' },
}

const MISAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [meterType, setMeterType] = useState('')

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
      toast.error('Error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format) => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams({ format })
      if (meterType) params.append('meterType', meterType)

      const response = await axios.get(`${API_URL}/meters/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: format === 'csv' ? 'blob' : 'json',
      })

      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `meter_analytics_${period}_${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('CSV exported successfully!')
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `meter_analytics_${period}_${new Date().toISOString().split('T')[0]}.json`
        a.click()
        window.URL.revokeObjectURL(url)
        toast.success('JSON exported for Power BI!')
      }
    } catch (error) {
      toast.error('Error exporting data')
    }
  }

  const periods = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ]

  const getMeterTypeBreakdown = () => {
    if (!analytics?.byMeterType) return []
    return Object.entries(analytics.byMeterType).map(([type, data]) => ({
      type,
      config: meterConfigs[type] || { icon: Gauge, color: '#6B7280', label: type },
      ...data,
    }))
  }

  const getChartData = () => {
    if (!analytics?.chartData) return []
    return analytics.chartData
  }

  // Simple bar chart visualization
  const maxConsumption = Math.max(...(getChartData().map(d => d.totalConsumption) || [1]))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500 mt-1">Consumption trends, patterns, and insights</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            {periods.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {/* Meter Type Filter */}
          <select
            value={meterType}
            onChange={(e) => setMeterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          >
            <option value="">All Types</option>
            {Object.entries(meterConfigs).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Export Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10 hidden group-hover:block">
              <button
                onClick={() => handleExport('csv')}
                className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="flex items-center gap-2 w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Export for Power BI (JSON)
              </button>
            </div>
          </div>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Total Readings</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics?.stats?.totalReadings || 0}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Total Consumption</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics?.stats?.totalConsumption?.toFixed(1) || 0}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">Avg Consumption</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics?.stats?.avgConsumption?.toFixed(2) || 0}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Max Reading</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{analytics?.stats?.maxReading?.toFixed(1) || 0}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Consumption Over Time */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Consumption Over Time</h2>
              
              {getChartData().length > 0 ? (
                <div className="space-y-4">
                  {/* Simple bar chart */}
                  <div className="flex items-end gap-1 h-48 px-4">
                    {getChartData().slice(-14).map((data, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t transition-all hover:from-purple-600 hover:to-indigo-600"
                          style={{ height: `${(data.totalConsumption / maxConsumption) * 100}%`, minHeight: '4px' }}
                          title={`${data.date}: ${data.totalConsumption.toFixed(2)}`}
                        />
                      </div>
                    ))}
                  </div>
                  {/* X-axis labels */}
                  <div className="flex gap-1 px-4 text-xs text-gray-400">
                    {getChartData().slice(-14).map((data, idx) => (
                      <div key={idx} className="flex-1 text-center truncate">
                        {new Date(data.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  <p>No data available for this period</p>
                </div>
              )}
            </div>

            {/* Meter Type Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">By Meter Type</h2>
              
              {getMeterTypeBreakdown().length > 0 ? (
                <div className="space-y-4">
                  {getMeterTypeBreakdown().map((item) => {
                    const Icon = item.config.icon
                    const totalReadings = analytics?.stats?.totalReadings || 1
                    const percentage = ((item.count / totalReadings) * 100).toFixed(1)
                    
                    return (
                      <div key={item.type}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4" style={{ color: item.config.color }} />
                            <span className="text-sm font-medium text-gray-700">{item.config.label}</span>
                          </div>
                          <span className="text-sm text-gray-500">{item.count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${percentage}%`, 
                              backgroundColor: item.config.color 
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  <p>No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Consumption by Type Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Consumption Summary by Type</h2>
            
            {getMeterTypeBreakdown().length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Meter Type</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Readings</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Consumption</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Avg/Reading</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getMeterTypeBreakdown().map((item) => {
                      const Icon = item.config.icon
                      const totalConsumption = analytics?.stats?.totalConsumption || 1
                      const percentage = ((item.totalConsumption / totalConsumption) * 100).toFixed(1)
                      const avgPerReading = item.count > 0 ? (item.totalConsumption / item.count).toFixed(2) : 0
                      
                      return (
                        <tr key={item.type} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: `${item.config.color}20` }}
                              >
                                <Icon className="w-4 h-4" style={{ color: item.config.color }} />
                              </div>
                              <span className="font-medium text-gray-900">{item.config.label}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right font-mono">{item.count}</td>
                          <td className="py-4 px-4 text-right font-mono font-medium">{item.totalConsumption.toFixed(2)}</td>
                          <td className="py-4 px-4 text-right font-mono text-gray-500">{avgPerReading}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ 
                                    width: `${percentage}%`, 
                                    backgroundColor: item.config.color 
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-500 w-12 text-right">{percentage}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <p>No data available for this period</p>
              </div>
            )}
          </div>

          {/* Alerts Section */}
          {analytics?.alerts && analytics.alerts.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                </div>
                Consumption Alerts
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Readings with significant consumption changes (±50% from previous)
              </p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analytics.alerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border ${
                      alert.type === 'HIGH_CONSUMPTION' 
                        ? 'bg-red-50 border-red-100' 
                        : 'bg-green-50 border-green-100'
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
                        {alert.type === 'HIGH_CONSUMPTION' ? 'High Consumption' : 'Low Consumption'}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900">{alert.meterName}</p>
                    <p className="text-sm text-gray-500">{alert.location}</p>
                    <p className="text-sm font-mono mt-2">
                      Change: {alert.consumption > 0 ? '+' : ''}{alert.consumption?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MISAnalytics
