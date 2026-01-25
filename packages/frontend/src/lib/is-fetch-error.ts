import { ApiError } from './fetch'

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}
