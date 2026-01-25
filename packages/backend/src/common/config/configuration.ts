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
})

export type Configuration = ReturnType<typeof configuration>
