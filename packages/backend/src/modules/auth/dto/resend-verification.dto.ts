import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'
import type {
  ResendVerificationRequest,
  ResendVerificationResponse,
} from '@easy-auth/shared'

export class ResendVerificationRequestDto implements ResendVerificationRequest {
  @ApiProperty({
    description: 'Email address to resend verification to',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string
}

export class ResendVerificationResponseDto implements ResendVerificationResponse {
  @ApiProperty({
    description: 'API response data',
    example: { success: true },
  })
  data: { success: boolean }
}
