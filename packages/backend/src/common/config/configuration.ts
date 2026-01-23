export const configuration = () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/easy-auth',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
})

export type Configuration = ReturnType<typeof configuration>
