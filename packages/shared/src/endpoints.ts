export type EndpointConfig = {
  path: string
  method: 'get' | 'post' | 'patch'
  auth?: boolean
  sensitive?: boolean
}

export const Endpoints = {
  health: 'health',
  signin: 'signin',
  signup: 'signup',
  signout: 'signout',
  verifyEmail: 'verifyEmail',
  resendVerification: 'resendVerification',
  getCurrentUser: 'getCurrentUser',
  updateCurrentUser: 'updateCurrentUser',
}

export const ENDPOINT_CONFIGS: Record<keyof typeof Endpoints, EndpointConfig> =
  {
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
    verifyEmail: {
      method: 'post',
      path: '/api/v1/verify-email',
    },
    resendVerification: {
      method: 'post',
      path: '/api/v1/resend-verification',
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
