import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  Settings,
  TrendingUp,
  Calendar,
  Bell,
  ArrowLeft,
  Building,
  Wrench,
  Package,
  ClipboardList,
  Activity,
} from 'lucide-react'

const MISDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Placeholder stats
  const stats = [
    { label: 'Total Reports', value: '0', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Projects', value: '0', icon: Building, color: 'from-purple-500 to-pink-500' },
    { label: 'Team Members', value: '0', icon: Users, color: 'from-green-500 to-emerald-500' },
    { label: 'Pending Tasks', value: '0', icon: ClipboardList, color: 'from-orange-500 to-red-500' },
  ]

  // MIS Modules (Coming Soon)
  const modules = [
    { name: 'Analytics', icon: BarChart3, status: 'coming_soon', path: '/mis/analytics' },
    { name: 'Reports', icon: FileText, status: 'coming_soon', path: '/mis/reports' },
    { name: 'Inventory', icon: Package, status: 'coming_soon', path: '/mis/inventory' },
    { name: 'Maintenance', icon: Wrench, status: 'coming_soon', path: '/mis/maintenance' },
    { name: 'Projects', icon: Building, status: 'coming_soon', path: '/mis/projects' },
    { name: 'Settings', icon: Settings, status: 'coming_soon', path: '/mis/settings' },
  ]

  const handleBackToSelector = () => {
    localStorage.removeItem('selectedSystem')
    navigate('/select-system')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToSelector}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Back to System Selector"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <LayoutDashboard className="w-7 h-7" />
                  MIS Dashboard
                </h1>
                <p className="text-purple-200 text-sm">Management Information System</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="text-right">
                <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-purple-200 text-xs">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Activity className="w-5 h-5 text-gray-300" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to MIS!</h2>
              <p className="text-purple-100 max-w-xl">
                The Management Information System is under development. 
                New modules and features will be added here progressively.
              </p>
            </div>
            <div className="hidden lg:block">
              <LayoutDashboard className="w-24 h-24 text-white/20" />
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <h3 className="text-lg font-semibold text-gray-900 mb-4">MIS Modules</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {modules.map((module, idx) => {
            const Icon = module.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer group relative"
              >
                {module.status === 'coming_soon' && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                    Soon
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
                  <Icon className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm font-medium text-gray-700">{module.name}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={handleBackToSelector}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Switch System</p>
                <p className="text-sm text-gray-500">Go to Work Permit</p>
              </div>
            </button>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl opacity-50 cursor-not-allowed">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Generate Report</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl opacity-50 cursor-not-allowed">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Analytics</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} YP Security Services Pvt Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MISDashboard
