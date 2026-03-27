import { registerAs } from '@nestjs/config'

export default registerAs('mailer', () => ({
  from: process.env.EMAIL_FROM,
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
}))
