import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Component as Signin } from '@/routes/signin'
import { Component as Signup } from '@/routes/signup'

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<Navigate to="/signin" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
