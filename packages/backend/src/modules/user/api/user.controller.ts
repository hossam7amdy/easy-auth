import { Controller, Get, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/infrastructure/guards'
import { CurrentUser } from '../../../common/decorators'
import {
  CurrentUserDto,
  CurrentUserResponseDto,
} from './dto/get-current-user.dto'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import { HttpResponse } from '../../../common/http'

@ApiTags('Users')
@Controller()
export class UserController {
  constructor() {}

  @Get(ENDPOINT_CONFIGS.getCurrentUser.path)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: CurrentUserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: CurrentUserDto): CurrentUserResponseDto {
    return new HttpResponse(user)
  }
}
