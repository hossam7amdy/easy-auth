import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import type { VerifyEmailRequest, VerifyEmailResponse } from '@easy-auth/shared'

export class VerifyEmailRequestDto implements VerifyEmailRequest {
  @ApiProperty({
    description: 'Verification token from email link',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  token: string
}

export class VerifyEmailResponseDto implements VerifyEmailResponse {
  @ApiProperty({
    description: 'API response data',
    example: { success: true },
  })
  data: { success: boolean }
}
