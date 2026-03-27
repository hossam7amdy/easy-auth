import { plainToInstance } from 'class-transformer'
import {
  IsInt,
  IsUrl,
  IsString,
  validateSync,
  IsEnum,
  IsNotEmpty,
} from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsInt()
  @IsNotEmpty()
  PORT: number

  @IsEnum(NodeEnv)
  @IsNotEmpty()
  NODE_ENV: `${NodeEnv}`

  @IsUrl({ require_tld: false, protocols: ['mongodb'] })
  @IsNotEmpty()
  MONGODB_URI: string

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  FRONTEND_URL: string

  @IsString()
  @IsNotEmpty()
  ALLOWED_CORS: string

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN: string

  @IsInt()
  @IsNotEmpty()
  THROTTLE_TTL: number

  @IsInt()
  @IsNotEmpty()
  THROTTLE_LIMIT: number

  @IsString()
  @IsNotEmpty()
  EMAIL_FROM: string

  @IsString()
  @IsNotEmpty()
  SMTP_HOST: string

  @IsInt()
  @IsNotEmpty()
  SMTP_PORT: number

  @IsString()
  @IsNotEmpty()
  SMTP_SECURE: string

  @IsString()
  @IsNotEmpty()
  SMTP_USER: string

  @IsString()
  @IsNotEmpty()
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
