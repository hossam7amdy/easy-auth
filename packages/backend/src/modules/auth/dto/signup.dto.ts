import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator'
import type { SignUpRequest, SignUpResponse, User } from '@easy-auth/shared'

export class SignUpRequestDto implements SignUpRequest {
  @ApiProperty({
    example: 'hossam@easy.com',
    description: 'Valid email address',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({
    example: 'Hossam Hamdy',
    description: 'User name (minimum 3 characters)',
  })
  @IsString()
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string

  @ApiProperty({
    example: 'SecureP@ss1',
    description:
      'Password with at least 8 characters, one letter, one number, and one special character',
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  @Matches(/\d/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*(),.?":{}|<>]/, {
    message: 'Password must contain at least one special character',
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string
}

class UserDto implements User {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string

  @ApiProperty({ example: 'hossam@easy.com' })
  email: string

  @ApiProperty({ example: 'Hossam Hamdy' })
  name: string

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  createdAt: string | Date

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  updatedAt: string | Date
}

class SignUpDataDto {
  @ApiProperty({ type: UserDto })
  user: UserDto
}

export class SignUpResponseDto implements SignUpResponse {
  @ApiProperty({ type: SignUpDataDto })
  data: SignUpDataDto
}
