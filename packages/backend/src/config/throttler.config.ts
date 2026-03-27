import { registerAs } from '@nestjs/config'

export default registerAs('throttler', () => ({
  default: {
    ttl: parseInt(process.env.THROTTLE_TTL, 10),
    limit: parseInt(process.env.THROTTLE_LIMIT, 10),
  },
}))
