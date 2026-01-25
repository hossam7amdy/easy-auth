import {
  useQuery,
  type QueryKey,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  ENDPOINT_CONFIGS,
  type GetCurrentUserRequest,
  type GetCurrentUserResponse,
} from '@easy-auth/shared'
import { ApiError, callEndpoint } from '@/lib/fetch'

const GET_CURRENT_USER_QUERY_KEY = 'current-user'

type QueryOptions = Omit<
  UseQueryOptions<
    GetCurrentUserResponse,
    ApiError,
    GetCurrentUserResponse,
    QueryKey
  >,
  'queryFn' | 'queryKey'
>

export function useGetCurrentUser(options?: QueryOptions) {
  const { data, ...rest } = useQuery({
    queryKey: [GET_CURRENT_USER_QUERY_KEY],
    queryFn: () =>
      callEndpoint<GetCurrentUserRequest, GetCurrentUserResponse>(
        ENDPOINT_CONFIGS.getCurrentUser,
      ),
    ...options,
  })
  return { ...data, ...rest }
}
