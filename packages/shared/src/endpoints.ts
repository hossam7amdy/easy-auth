export type EndpointConfig = {
  path: string
  method: 'get' | 'post' | 'patch'
  auth?: boolean
  sensitive?: boolean
}

export const ENDPOINT_CONFIGS = {
  health: {
    method: 'get',
    path: '/api/healthz',
  },
  signin: {
    method: 'post',
    path: '/api/v1/signin',
    sensitive: true,
  },
  signup: {
    method: 'post',
    path: '/api/v1/signup',
    sensitive: true,
  },
  signout: {
    method: 'post',
    path: '/api/v1/signout',
    auth: true,
  },
  getCurrentUser: {
    method: 'get',
    path: '/api/v1/users/me',
    auth: true,
  },
  updateCurrentUser: {
    method: 'patch',
    path: '/api/v1/users/me',
    auth: true,
  },
} as const
