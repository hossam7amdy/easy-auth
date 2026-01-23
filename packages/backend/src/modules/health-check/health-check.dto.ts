import { ApiProperty } from '@nestjs/swagger'
import type { HealthCheckResponse } from '@easy-auth/shared'

class HealthDataDto {
  @ApiProperty({ example: 'ok 🚀' })
  status: string

  @ApiProperty({ example: '2023-01-01T00:00:00.000Z' })
  timestamp: string

  @ApiProperty({ example: 'easy-auth-backend' })
  service: string
}

export class HealthCheckResponseDto implements HealthCheckResponse {
  @ApiProperty({ type: HealthDataDto })
  data: HealthDataDto
}
