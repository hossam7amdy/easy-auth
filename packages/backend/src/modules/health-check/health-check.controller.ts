import { Controller, Get } from '@nestjs/common'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import type { HealthCheckResponse } from '@easy-auth/shared'

@Controller()
export class HealthCheckController {
  @Get(ENDPOINT_CONFIGS.health.path)
  check(): HealthCheckResponse {
    return {
      status: 'ok 🚀',
      timestamp: new Date().toISOString(),
      service: 'easy-auth-backend',
    }
  }
}
