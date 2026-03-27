import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigType } from '@nestjs/config'
import { UserModule } from '../user/user.module'
import { EmailModule } from '../email/email.module'
import { VerificationModule } from '../verification/verification.module'
import { AuthController } from './controllers/auth.controller'
import { AuthService } from './services/auth.service'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies/jwt.strategy'
import jwtConfig from '../../config/jwt.config'

@Module({
  imports: [
    UserModule,
    EmailModule,
    VerificationModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.secret,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
