import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Legacy redirect components to preserve IDs
const LegacyPermitRedirect = () => {
  const { id } = useParams()
  return <Navigate to={`/workpermit/permits/${id}`} replace />
}

const LegacyPermitEditRedirect = () => {
  const { id } = useParams()
  return <Navigate to={`/workpermit/permits/${id}/edit`} replace />
}

const LegacyApprovalRedirect = () => {
  const { id } = useParams()
  return <Navigate to={`/workpermit/approvals/${id}`} replace />
}
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
import MISLayout from './components/MISLayout'
import MISDashboard from './pages/mis/MISDashboard'
import MISAnalytics from './pages/mis/MISAnalytics'
import MISExport from './pages/mis/MISExport'

// Protected route wrapper with role and permission support
const ProtectedRoute = ({ children, roles, permission }) => {
  const { user, loading, hasPermission, isAdmin } = useAuth()

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

  // Admin can access everything
  if (isAdmin) {
    return children
  }

  // Check role-based access (for backward compatibility)
  if (roles && roles.length > 0) {
    if (roles.includes(user.role)) {
      return children
    }
    // Also check if user has the related permission
    // This allows custom roles with appropriate permissions to access the route
    if (permission && hasPermission(permission)) {
      return children
    }
    return <Navigate to="/select-system" replace />
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
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
        
        {/* Users with approval permission (Fireman, Admin, or custom roles with approvals.view) */}
        <Route
          path="approvals"
          element={
            <ProtectedRoute roles={['FIREMAN', 'SAFETY_OFFICER', 'ADMIN']} permission="approvals.view">
              <Approvals />
            </ProtectedRoute>
          }
        />
        <Route
          path="approvals/:id"
          element={
            <ProtectedRoute roles={['FIREMAN', 'SAFETY_OFFICER', 'ADMIN']} permission="approvals.view">
              <ApprovalDetail />
            </ProtectedRoute>
          }
        />

        {/* Users with user management permission (Admin or custom roles with users.view) */}
        <Route
          path="users"
          element={
            <ProtectedRoute roles={['ADMIN']} permission="users.view">
              <Users />
            </ProtectedRoute>
          }
        />
        {/* Roles management (Admin or custom roles with roles.view) */}
        <Route
          path="roles"
          element={
            <ProtectedRoute roles={['ADMIN']} permission="roles.view">
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
          <ProtectedRoute roles={['ADMIN', 'FIREMAN', 'SAFETY_OFFICER', 'SITE_ENGINEER']}>
            <MISLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/mis/dashboard" replace />} />
        <Route path="dashboard" element={<MISDashboard />} />
        <Route path="readings" element={<MeterReadings />} />
        <Route path="analytics" element={<MISAnalytics />} />
        <Route path="export" element={<MISExport />} />
      </Route>

      {/* Legacy routes - redirect to new structure */}
      <Route path="/dashboard" element={<Navigate to="/workpermit/dashboard" replace />} />
      <Route path="/permits" element={<Navigate to="/workpermit/permits" replace />} />
      <Route path="/permits/new" element={<Navigate to="/workpermit/permits/new" replace />} />
      <Route path="/permits/create" element={<Navigate to="/workpermit/permits/create" replace />} />
      <Route path="/permits/:id" element={<LegacyPermitRedirect />} />
      <Route path="/permits/:id/edit" element={<LegacyPermitEditRedirect />} />
      <Route path="/approvals" element={<Navigate to="/workpermit/approvals" replace />} />
      <Route path="/approvals/:id" element={<LegacyApprovalRedirect />} />
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
