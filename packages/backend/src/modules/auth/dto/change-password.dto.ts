import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '@easy-auth/shared'
import { IsPassword } from '../../../common/decorators'

export class ChangePasswordRequestDto implements ChangePasswordRequest {
  @ApiProperty({
    example: 'OldP@ss1',
    description: 'Current password for verification',
  })
  @IsString()
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string

  @ApiProperty({
    example: 'NewP@ss2',
    description:
      'New password with at least 8 characters, one letter, one number, and one special character',
  })
  @IsPassword()
  newPassword: string
}

class ChangePasswordDataDto {
  @ApiProperty({ example: true })
  success: boolean
}

export class ChangePasswordResponseDto implements ChangePasswordResponse {
  @ApiProperty({ type: ChangePasswordDataDto })
  data: ChangePasswordDataDto
}
