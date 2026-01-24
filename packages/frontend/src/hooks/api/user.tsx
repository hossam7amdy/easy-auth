import { useQuery } from '@tanstack/react-query'
import {
  ENDPOINT_CONFIGS,
  type GetCurrentUserRequest,
  type GetCurrentUserResponse,
} from '@easy-auth/shared'
import { callEndpoint } from '@/lib/fetch'

const GET_CURRENT_USER_QUERY_KEY = 'current-user'

export function useGetCurrentUser() {
  const { data, ...rest } = useQuery({
    queryKey: [GET_CURRENT_USER_QUERY_KEY],
    queryFn: () =>
      callEndpoint<GetCurrentUserRequest, GetCurrentUserResponse>(
        ENDPOINT_CONFIGS.getCurrentUser,
      ),
  })
  return { ...data, ...rest }
}
