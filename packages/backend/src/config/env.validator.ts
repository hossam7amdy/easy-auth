import { plainToInstance } from 'class-transformer'
import { IsInt, IsUrl, IsString, validateSync, IsEnum } from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsInt()
  PORT: number = 3000

  @IsEnum(NodeEnv)
  NODE_ENV: `${NodeEnv}` = NodeEnv.Development

  @IsUrl({ require_tld: false, protocols: ['mongodb'] })
  MONGODB_URI: string = 'mongodb://localhost:27017/easy-auth'

  @IsUrl({ require_tld: false })
  FRONTEND_URL: string = 'http://localhost:5173'

  @IsString()
  ALLOWED_CORS: string = 'http://localhost:5173'

  @IsString()
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string

  @IsString()
  JWT_EXPIRES_IN: string = '15m'

  @IsInt()
  THROTTLE_TTL: number = 60000

  @IsInt()
  THROTTLE_LIMIT: number = 60

  @IsString()
  EMAIL_FROM: string = 'noreply@localhost'

  @IsString()
  SMTP_HOST: string = 'localhost'

  @IsInt()
  SMTP_PORT: number = 1025

  @IsString()
  SMTP_SECURE: string = 'false'

  @IsString()
  SMTP_USER: string

  @IsString()
  SMTP_PASS: string
}

export default function envValidator(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  })
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    const cause = errors.map((error) => ({
      property: error.property,
      constraints: error.constraints,
    }))
    throw new Error('Invalid environment variable(s)', { cause })
  }
  return validatedConfig
}
