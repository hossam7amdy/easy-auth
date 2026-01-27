import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiCreatedResponse,
} from '@nestjs/swagger'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import { AuthService } from '../core/application/services/auth.service'
import { SignUpRequestDto, SignUpResponseDto } from './dto/signup.dto'
import { SignInRequestDto, SignInResponseDto } from './dto/signin.dto'
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
  @ApiOkResponse({ type: SignInResponseDto })
  async signIn(
    @Body() signInDto: SignInRequestDto,
  ): Promise<SignInResponseDto> {
    const user = await this.authService.signIn(signInDto)
    return new HttpResponse(user)
  }
}
