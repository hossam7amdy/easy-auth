export const configuration = () => ({
  port: parseInt(process.env.PORT!),
  database: {
    uri: process.env.MONGODB_URI,
  },
  frontend: {
    url: process.env.FRONTEND_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN as '15m',
  },
  throttler: {
    default: {
      ttl: parseInt(process.env.THROTTLE_TTL!),
      limit: parseInt(process.env.THROTTLE_LIMIT!),
    },
  },
})

export type Configuration = ReturnType<typeof configuration>
