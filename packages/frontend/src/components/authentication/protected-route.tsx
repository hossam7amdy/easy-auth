import { useGetCurrentUser } from '@/hooks/api'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../ui/spinner'
import { getLocalStorageJWT } from '@/lib/jwt'

export function ProtectedRoute() {
  const location = useLocation()
  const isLoggedIn = !!getLocalStorageJWT()
  const { isLoading, isSuccess } = useGetCurrentUser({
    enabled: isLoggedIn,
  })

  if (isLoading) {
    return <Spinner />
  }

  const isAuthenticated = isLoggedIn && isSuccess
  if (!isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
