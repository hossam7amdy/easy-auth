import { Controller, Get, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards'
import { CurrentUser } from '../../common/decorators'
import { CurrentUserDto } from './dto/get-current-user.dto'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor() {}

  @Get(ENDPOINT_CONFIGS.getCurrentUser.path)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, type: CurrentUserDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@CurrentUser() user: CurrentUserDto) {
    return user
  }
}
