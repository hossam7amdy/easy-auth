import { useGetCurrentUser } from '@/hooks/api'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../ui/spinner'

export function ProtectedRoute() {
  const location = useLocation()
  const { data: isAuthenticated, isLoading } = useGetCurrentUser()

  if (isLoading) {
    return <Spinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
