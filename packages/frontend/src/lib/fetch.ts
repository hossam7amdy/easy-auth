import type {
  EndpointConfig,
  ApiError as EndpointError,
} from '@easy-auth/shared'
import { QueryClient } from '@tanstack/react-query'
import { getLocalStorageJWT, removeLocalStorageJWT } from './jwt'

export const API_HOST: string =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

export class ApiError extends Error {
  public status: number

  constructor(status: number, msg: string) {
    super(msg)
    this.status = status
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      retry(failureCount, error) {
        const { status } = error as ApiError
        if (typeof status !== 'number') {
          console.error('got non-numeric error code:', error)
          return true
        }
        return status >= 500 && failureCount < 2
      },
    },
  },
})

export async function callEndpoint<Request, Response>(
  endpoint: EndpointConfig,
  request?: Request,
): Promise<Response> {
  const { path, method, auth } = endpoint
  const requestBody = request ? JSON.stringify(request) : undefined
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(auth && {
      Authorization: `Bearer ${getLocalStorageJWT()}`,
    }),
  }

  const response = await fetch(`${API_HOST}${path}`, {
    method: method.toUpperCase(),
    headers,
    body: requestBody,
  })
  if (!response.ok) {
    if (response.status === 401) {
      removeLocalStorageJWT()
    }
    let msg = 'Fetch Error'
    try {
      const json: EndpointError = await response.json()
      msg = json.message
    } finally {
      throw new ApiError(response.status, msg)
    }
  }
  const isJson = response.headers
    .get('content-type')
    ?.includes('application/json')
  return isJson ? ((await response.json()) as Response) : ({} as Response)
}
