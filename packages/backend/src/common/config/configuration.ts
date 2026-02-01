export const configuration = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri: process.env.MONGODB_URI,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
  throttler: {
    default: {
      ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10),
      limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
    },
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@localhost',
    smtp: {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025', 10),
      secure: process.env.SMTP_SECURE === 'true',
      ...(process.env.SMTP_USER && {
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      }),
    },
  },
})

export type Configuration = ReturnType<typeof configuration>
