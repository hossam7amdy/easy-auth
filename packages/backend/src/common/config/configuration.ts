export const configuration = () => ({
  port: process.env.PORT,
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
})

export type Configuration = ReturnType<typeof configuration>
