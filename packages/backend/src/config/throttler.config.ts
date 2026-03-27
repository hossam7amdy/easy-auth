import { registerAs } from '@nestjs/config'

export default registerAs('throttler', () => ({
  default: {
    ttl: process.env.THROTTLE_TTL,
    limit: process.env.THROTTLE_LIMIT,
  },
}))
