import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import { AuthService } from './auth.service'
import { SignUpRequestDto, SignUpResponseDto } from './dto/signup.dto'
import { HttpResponse } from '../../common/http'

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ENDPOINT_CONFIGS.signup.path)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user account' })
  @ApiResponse({ status: 201, type: SignUpResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'User with this email already exists' })
  async signUp(
    @Body() signUpDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    const user = await this.authService.signUp(signUpDto)
    return new HttpResponse(user)
  }
}
