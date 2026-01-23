import { useQuery } from '@tanstack/react-query'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import type { HealthCheckRequest, HealthCheckResponse } from '@easy-auth/shared'
import { callEndpoint } from './lib/fetch'

export function App() {
  const {
    data: health,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['health'],
    queryFn: () =>
      callEndpoint<HealthCheckRequest, HealthCheckResponse>(
        ENDPOINT_CONFIGS.health,
      ),
  })

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white mb-8">
          Health Check Status
        </h1>

        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-purple-300 text-xl">Checking backend...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-6 max-w-md">
            <h2 className="text-2xl font-semibold text-red-400 mb-2">
              ❌ Connection Failed
            </h2>
            <p className="text-red-300">{error.message}</p>
          </div>
        )}

        {health && (
          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg p-6 max-w-md space-y-4">
            <h2 className="text-3xl font-semibold text-green-400 mb-4">
              ✅ Backend is Healthy!
            </h2>
            <div className="text-left space-y-2 text-lg">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-300 font-medium">
                  {health.data.status.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Service:</span>
                <span className="text-purple-300 font-medium">
                  {health.data.service}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Timestamp:</span>
                <span className="text-blue-300 font-mono text-sm">
                  {new Date(health.data.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-gray-400 text-sm">
          <p>Frontend ↔️ Backend Connectivity Test</p>
        </div>
      </div>
    </div>
  )
}

export default App
