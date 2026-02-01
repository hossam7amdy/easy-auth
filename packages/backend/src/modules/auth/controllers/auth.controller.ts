import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import { AuthService } from '../services/auth.service'
import { SignUpRequestDto, SignUpResponseDto } from '../dto/signup.dto'
import { SignInRequestDto, SignInResponseDto } from '../dto/signin.dto'
import {
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
} from '../dto/verify-email.dto'
import {
  ResendVerificationRequestDto,
  ResendVerificationResponseDto,
} from '../dto/resend-verification.dto'
import { HttpResponse } from '../../../common/http'

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ENDPOINT_CONFIGS.signup.path)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiCreatedResponse({ type: SignUpResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  async signUp(
    @Body() signUpDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    const user = await this.authService.signUp(signUpDto)
    return new HttpResponse(user)
  }

  @Post(ENDPOINT_CONFIGS.signin.path)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in to an existing user account' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiForbiddenResponse({ description: 'Email not verified' })
  @ApiOkResponse({ type: SignInResponseDto })
  async signIn(
    @Body() signInDto: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    const user = await this.authService.signIn(signInDto)
    return new HttpResponse(user)
  }

  @Post(ENDPOINT_CONFIGS.verifyEmail.path)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @ApiOkResponse({ type: VerifyEmailResponseDto })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailRequestDto,
  ): Promise<VerifyEmailResponseDto> {
    const result = await this.authService.verifyEmail(verifyEmailDto.token)
    return new HttpResponse(result)
  }

  @Post(ENDPOINT_CONFIGS.resendVerification.path)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 300000, limit: 3 } }) // 3 requests per 5 minutes
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiOkResponse({ type: ResendVerificationResponseDto })
  async resendVerification(
    @Body() resendDto: ResendVerificationRequestDto,
  ): Promise<ResendVerificationResponseDto> {
    const result = await this.authService.resendVerification(resendDto.email)
    return new HttpResponse(result)
  }
}
