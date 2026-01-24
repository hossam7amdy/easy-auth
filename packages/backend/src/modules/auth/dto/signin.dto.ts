import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, IsNotEmpty } from 'class-validator'
import type { SignInRequest, SignInResponse } from '@easy-auth/shared'

export class SignInRequestDto implements SignInRequest {
  @ApiProperty({
    example: 'hossam@easy.com',
    description: 'Valid email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({
    example: 'SecureP@ss1',
    description: 'User valid password',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string
}

class SignInResponseDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  jwt: string
}

export class SignInResponseDto implements SignInResponse {
  @ApiProperty({ type: SignInResponseDataDto })
  data: SignInResponseDataDto
}
