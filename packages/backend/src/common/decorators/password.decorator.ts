import { applyDecorators } from '@nestjs/common'
import { IsString, MinLength, Matches, IsNotEmpty } from 'class-validator'

export function IsPassword() {
  return applyDecorators(
    IsString(),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    Matches(/[a-zA-Z]/, {
      message: 'Password must contain at least one letter',
    }),
    Matches(/\d/, { message: 'Password must contain at least one number' }),
    Matches(/[!@#$%^&*(),.?":{}|<>]/, {
      message: 'Password must contain at least one special character',
    }),
    IsNotEmpty({ message: 'Password is required' }),
  )
}
