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
      path: '/healthz',
    },
    signin: {
      method: 'post',
      path: '/v1/auth/signin',
      sensitive: true,
    },
    signup: {
      method: 'post',
      path: '/v1/auth/signup',
      sensitive: true,
    },
    signout: {
      method: 'post',
      path: '/v1/auth/signout',
      auth: true,
    },
    verifyEmail: {
      method: 'post',
      path: '/v1/auth/verify-email',
    },
    resendVerification: {
      method: 'post',
      path: '/v1/auth/resend-verification',
    },
    getCurrentUser: {
      method: 'get',
      path: '/v1/users/me',
      auth: true,
    },
    updateCurrentUser: {
      method: 'patch',
      path: '/v1/users/me',
      auth: true,
    },
  } as const
