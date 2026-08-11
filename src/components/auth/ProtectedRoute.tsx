import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'

export default function ProtectedRoute({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="grid min-h-[60vh] place-items-center text-muted">Loading…</div>
  if (!user) return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
  if (admin && role !== 'admin' && role !== 'staff') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
