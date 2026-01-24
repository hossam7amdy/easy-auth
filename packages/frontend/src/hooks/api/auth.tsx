import { useMutation, type UseMutationResult } from '@tanstack/react-query'
import {
  ENDPOINT_CONFIGS,
  type SignInRequest,
  type SignInResponse,
  type SignUpRequest,
  type SignUpResponse,
} from '@easy-auth/shared'
import { callEndpoint, queryClient, type ApiError } from '@/lib/fetch'
import { removeLocalStorageJWT, setLocalStorageJWT } from '@/lib/jwt'

export function useSignIn(): UseMutationResult<
  SignInResponse,
  ApiError,
  SignInRequest
> {
  return useMutation({
    mutationFn: (data: SignInRequest) =>
      callEndpoint<SignInRequest, SignInResponse>(
        ENDPOINT_CONFIGS.signin,
        data,
      ),
    onSuccess({ data }) {
      setLocalStorageJWT(data.jwt)
    },
  })
}

export function useSignUp(): UseMutationResult<
  SignUpResponse,
  ApiError,
  SignUpRequest
> {
  return useMutation({
    mutationFn: (data) =>
      callEndpoint<SignUpRequest, SignUpResponse>(
        ENDPOINT_CONFIGS.signup,
        data,
      ),
  })
}

export function useSignOut() {
  return useMutation({
    mutationFn: () => {
      removeLocalStorageJWT()
      queryClient.clear()
      return Promise.resolve({ success: true })
    },
  })
}
