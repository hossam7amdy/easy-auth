import type { User, GetCurrentUserResponse } from '@easy-auth/shared'

export class CurrentUserDto implements User {
  id: string
  name: string
  email: string
  createdAt: string | Date
  updatedAt: string | Date
}

export class CurrentUserResponseDto implements GetCurrentUserResponse {
  data: CurrentUserDto
}
