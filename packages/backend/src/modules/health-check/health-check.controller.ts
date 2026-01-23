import { Controller, Get } from '@nestjs/common'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { HealthCheckResponseDto } from './health-check.dto'
import { HttpResponse } from '../../common/http'

@ApiTags('Health')
@Controller()
export class HealthCheckController {
  @Get(ENDPOINT_CONFIGS.health.path)
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, type: HealthCheckResponseDto })
  check(): HealthCheckResponseDto {
    return new HttpResponse({
      status: 'ok 🚀',
      timestamp: new Date().toISOString(),
      service: 'easy-auth-backend',
    })
  }
}
