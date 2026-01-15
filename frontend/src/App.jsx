import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Permits from './pages/Permits'
import PermitDetail from './pages/PermitDetail'
import CreatePermit from './pages/CreatePermit'
import SelectPermitType from './pages/SelectPermitType'
import Approvals from './pages/Approvals'
import ApprovalDetail from './pages/ApprovalDetail'
import Users from './pages/Users'
import Settings from './pages/Settings'
import WorkerRegister from './pages/WorkerRegister'
import MeterReadings from './pages/MeterReadings'
import RoleManagement from './pages/RoleManagement'
import SSOCallback from './pages/SSOCallback'
import LoadingSpinner from './components/LoadingSpinner'

// New System Selector and MIS pages
import SystemSelector from './pages/SystemSelector'
import MISDashboard from './pages/mis/MISDashboard'

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/select-system" replace />
  }

  return children
}

// Public route wrapper (redirects if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    // Requestors go directly to Work Permit dashboard
    if (user.role === 'REQUESTOR') {
      return <Navigate to="/workpermit/dashboard" replace />
    }
    // Other roles see the system selector
    return <Navigate to="/select-system" replace />
  }

  return children
}

// System Selector Route (only for non-Requestor roles)
const SystemSelectorRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Requestors go directly to Work Permit
  if (user.role === 'REQUESTOR') {
    return <Navigate to="/workpermit/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      
      {/* Public worker registration route (QR code access) */}
      <Route path="/worker-register/:permitId" element={<WorkerRegister />} />
      
      {/* SSO Callback route */}
      <Route path="/auth/sso/callback" element={<SSOCallback />} />

      {/* System Selector (for Admin, Fireman, Site Engineer) */}
      <Route
        path="/select-system"
        element={
          <SystemSelectorRoute>
            <SystemSelector />
          </SystemSelectorRoute>
        }
      />

      {/* ======================= */}
      {/* WORK PERMIT SYSTEM ROUTES */}
      {/* ======================= */}
      <Route
        path="/workpermit"
        element={
          <ProtectedRoute>
            <Layout systemType="workpermit" />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/workpermit/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="permits" element={<Permits />} />
        <Route path="permits/new" element={<SelectPermitType />} />
        <Route path="permits/create" element={<CreatePermit />} />
        <Route path="permits/:id" element={<PermitDetail />} />
        <Route path="permits/:id/edit" element={<CreatePermit />} />
        
        {/* Fireman & Admin only */}
        <Route
          path="approvals"
          element={
            <ProtectedRoute roles={['SAFETY_OFFICER', 'ADMIN']}>
              <Approvals />
            </ProtectedRoute>
          }
        />
        <Route
          path="approvals/:id"
          element={
            <ProtectedRoute roles={['SAFETY_OFFICER', 'ADMIN']}>
              <ApprovalDetail />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="roles"
          element={
            <ProtectedRoute roles={['ADMIN']}>
              <RoleManagement />
            </ProtectedRoute>
          }
        />

        <Route path="settings" element={<Settings />} />
      </Route>

      {/* ======================= */}
      {/* MIS SYSTEM ROUTES */}
      {/* ======================= */}
      <Route
        path="/mis"
        element={
          <ProtectedRoute roles={['ADMIN', 'SAFETY_OFFICER', 'SITE_ENGINEER']}>
            <MISDashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/mis/dashboard" replace />} />
      </Route>
      <Route
        path="/mis/dashboard"
        element={
          <ProtectedRoute roles={['ADMIN', 'SAFETY_OFFICER', 'SITE_ENGINEER']}>
            <MISDashboard />
          </ProtectedRoute>
        }
      />

      {/* Legacy routes - redirect to new structure */}
      <Route path="/dashboard" element={<Navigate to="/workpermit/dashboard" replace />} />
      <Route path="/permits" element={<Navigate to="/workpermit/permits" replace />} />
      <Route path="/permits/*" element={<Navigate to="/workpermit/permits" replace />} />
      <Route path="/approvals" element={<Navigate to="/workpermit/approvals" replace />} />
      <Route path="/approvals/*" element={<Navigate to="/workpermit/approvals" replace />} />
      <Route path="/users" element={<Navigate to="/workpermit/users" replace />} />
      <Route path="/roles" element={<Navigate to="/workpermit/roles" replace />} />
      <Route path="/settings" element={<Navigate to="/workpermit/settings" replace />} />
      <Route path="/meters" element={<Navigate to="/mis/dashboard" replace />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/select-system" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/select-system" replace />} />
    </Routes>
  )
}

export default App
