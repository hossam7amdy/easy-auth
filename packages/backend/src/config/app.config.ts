import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: Number(process.env.PORT),
  frontendUrl: process.env.FRONTEND_URL,
  allowedCors: process.env.ALLOWED_CORS?.split(','),
}))
