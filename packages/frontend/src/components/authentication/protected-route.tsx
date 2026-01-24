import { Loader } from 'lucide-react'
import { useGetCurrentUser } from '@/hooks/api'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export function ProtectedRoute() {
  const location = useLocation()
  const { data: isAuthenticated, isLoading } = useGetCurrentUser()

  if (isLoading) {
    return <Loader className="animate-spin" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
