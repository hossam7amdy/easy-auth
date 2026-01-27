import type { UserDto } from './types.js'

export type Empty = Record<string, never>

export interface ApiResponse<T> {
  data: T
}

export type HealthCheckRequest = Empty
export type HealthCheckResponse = ApiResponse<{
  status: string
  timestamp: string
  service: string
}>

export type SignUpRequest = Pick<UserDto, 'name' | 'email'> & {
  password: string
}
export type SignUpResponse = ApiResponse<{
  id: string
}>

export type SignInRequest = {
  email: string
  password: string
}
export type SignInResponse = ApiResponse<{
  jwt: string
}>

export type SignOutRequest = Empty
export type SignOutResponse = ApiResponse<{
  success: true
}>

export type GetCurrentUserRequest = Empty
export type GetCurrentUserResponse = ApiResponse<UserDto>

export type UpdateCurrentUserRequest = Pick<UserDto, 'name'>
export type UpdateCurrentUserResponse = ApiResponse<UserDto>
