import {
  Controller,
  Post,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { ENDPOINT_CONFIGS, type UserDto } from '@easy-auth/shared'
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
import {
  ChangePasswordRequestDto,
  ChangePasswordResponseDto,
} from '../dto/change-password.dto'
import { HttpResponse } from '../../../common/http'
import { JwtAuthGuard } from '../guards/jwt-auth.guard'
import { CurrentUser } from '../../../common/decorators'

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

  @Put(ENDPOINT_CONFIGS.changePassword.path)
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { ttl: 900000, limit: 5 } }) // 5 requests per 15 minutes
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiOkResponse({ type: ChangePasswordResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid current password or validation failed',
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async changePassword(
    @CurrentUser() user: UserDto,
    @Body() changePasswordDto: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    const result = await this.authService.changePassword(
      user.id,
      changePasswordDto,
    )
    return new HttpResponse(result)
  }
}
