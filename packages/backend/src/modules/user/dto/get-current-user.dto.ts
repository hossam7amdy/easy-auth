import type { UserDto, GetCurrentUserResponse } from '@easy-auth/shared'
import { ApiProperty } from '@nestjs/swagger'

export class CurrentUserDto implements UserDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string

  @ApiProperty({ example: 'Hossam' })
  name: string

  @ApiProperty({ example: 'hossam@easy.com' })
  email: string

  @ApiProperty({ example: '2022-01-01T00:00:00.000Z' })
  createdAt: string | Date

  @ApiProperty({ example: '2022-01-01T00:00:00.000Z' })
  updatedAt: string | Date
}

export class CurrentUserResponseDto implements GetCurrentUserResponse {
  @ApiProperty({ type: CurrentUserDto })
  data: CurrentUserDto
}
