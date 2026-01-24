import { getLocalStorageJWT } from '@/lib/jwt'
import { Navigate, Outlet } from 'react-router-dom'

export function PublicRoute() {
  const isLoggedIn = getLocalStorageJWT()

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
