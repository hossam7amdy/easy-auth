import { UserDto } from '@easy-auth/shared'
import { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  user: UserDto
}
