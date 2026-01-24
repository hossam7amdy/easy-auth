import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Component as Signin } from '@/routes/signin'
import { Component as Signup } from '@/routes/signup'
import { Component as Dashboard } from '@/routes/dashboard'
import { ProtectedRoute, PublicRoute } from '@/components/authentication'

export function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <BrowserRouter>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
