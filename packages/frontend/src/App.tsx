import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute, PublicRoute } from '@/components/authentication'
import { ErrorBoundary } from './components/error-boundary'

const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        lazy: () => import('./routes/dashboard'),
      },
    ],
  },
  {
    element: <PublicRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/signin',
        lazy: () => import('./routes/signin'),
      },
      {
        path: '/signup',
        lazy: () => import('./routes/signup'),
      },
    ],
  },
  {
    path: '*',
    lazy: () => import('./routes/not-found'),
  },
])

export function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <RouterProvider router={router} />
    </div>
  )
}

export default App
