import type { UserDto } from './dto.js'

export interface ApiResponse<T> {
  data: T
}

export type SignUpRequest = Pick<UserDto, 'name' | 'email'> & {
  password: string
}
export type SignUpResponse = ApiResponse<{
  jwt: string
}>

export type SignInRequest = {
  email: string
  password: string
}
export type SignInResponse = ApiResponse<{
  user: UserDto
  jwt: string
}>

export type SignOutRequest = {}
export type SignOutResponse = ApiResponse<{
  success: true
}>

export type GetCurrentUserRequest = {}
export type GetCurrentUserResponse = ApiResponse<UserDto>

export type UpdateCurrentUserRequest = Pick<UserDto, 'name'>
export type UpdateCurrentUserResponse = ApiResponse<UserDto>
