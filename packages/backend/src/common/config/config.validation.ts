import { plainToInstance } from 'class-transformer'
import {
  IsInt,
  IsUrl,
  IsString,
  IsNotEmpty,
  IsOptional,
  validateSync,
} from 'class-validator'

class EnvironmentVariables {
  @IsInt()
  @IsOptional()
  PORT: number = 3000

  @IsUrl({ require_tld: false, protocols: ['mongodb'] })
  @IsOptional()
  MONGODB_URI: string = 'mongodb://localhost:27017/easy-auth'

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_URL: string = 'http://localhost:5173'

  @IsString()
  @IsNotEmpty({
    message: 'JWT_SECRET environment variable is required for security',
  })
  JWT_SECRET: string

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '15m'
}

export function validate(config: Record<string, unknown>) {
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
