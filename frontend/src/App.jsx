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
import LoadingSpinner from './components/LoadingSpinner'

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
    return <Navigate to="/dashboard" replace />
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
    return <Navigate to="/dashboard" replace />
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

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="permits" element={<Permits />} />
        <Route path="permits/new" element={<SelectPermitType />} />
        <Route path="permits/create" element={<CreatePermit />} />
        <Route path="permits/:id" element={<PermitDetail />} />
        <Route path="permits/:id/edit" element={<CreatePermit />} />
        
        {/* Safety Officer & Admin only */}
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

        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
