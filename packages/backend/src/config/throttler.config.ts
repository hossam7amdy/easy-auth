import { registerAs } from '@nestjs/config'

export default registerAs('throttler', () => ({
  default: {
    ttl: Number(process.env.THROTTLE_TTL),
    limit: Number(process.env.THROTTLE_LIMIT),
  },
}))
