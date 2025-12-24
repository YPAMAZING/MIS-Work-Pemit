import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { approvalsAPI } from '../services/api'
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Shield,
  ChevronDown,
} from 'lucide-react'

const Layout = () => {
  const { user, logout, isAdmin, isSafetyOfficer } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    if (isSafetyOfficer || isAdmin) {
      fetchPendingCount()
    }
  }, [isSafetyOfficer, isAdmin])

  const fetchPendingCount = async () => {
    try {
      const response = await approvalsAPI.getPendingCount()
      setPendingCount(response.data.count)
    } catch (error) {
      console.error('Error fetching pending count:', error)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SAFETY_OFFICER', 'REQUESTOR'],
    },
    {
      name: 'Permits',
      path: '/permits',
      icon: FileText,
      roles: ['ADMIN', 'SAFETY_OFFICER', 'REQUESTOR'],
    },
    {
      name: 'Approvals',
      path: '/approvals',
      icon: CheckSquare,
      roles: ['ADMIN', 'SAFETY_OFFICER'],
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      name: 'Users',
      path: '/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: ['ADMIN', 'SAFETY_OFFICER', 'REQUESTOR'],
    },
  ]

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role)
  )

  const getRoleBadge = (role) => {
    const badges = {
      ADMIN: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Admin' },
      SAFETY_OFFICER: { bg: 'bg-green-100', text: 'text-green-700', label: 'Safety Officer' },
      REQUESTOR: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Requestor' },
    }
    return badges[role] || badges.REQUESTOR
  }

  const roleBadge = getRoleBadge(user?.role)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Safetymint Dark Blue Style */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-slate-800 to-slate-900 transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">MIS</h1>
            <p className="text-xs text-slate-400">Permit Management</p>
          </div>
          <button
            className="lg:hidden ml-auto p-1 rounded-lg hover:bg-slate-700"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-500/20 text-emerald-400 border-l-4 border-emerald-400' 
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1 font-medium">{item.name}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                user?.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' :
                user?.role === 'SAFETY_OFFICER' ? 'bg-emerald-500/20 text-emerald-300' :
                'bg-blue-500/20 text-blue-300'
              }`}>
                {roleBadge.label}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-3">
              {/* Notifications */}
              {(isSafetyOfficer || isAdmin) && pendingCount > 0 && (
                <button
                  onClick={() => navigate('/approvals')}
                  className="relative p-2 rounded-lg hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-4 h-4 text-xs font-semibold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {pendingCount}
                  </span>
                </button>
              )}

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <NavLink
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
