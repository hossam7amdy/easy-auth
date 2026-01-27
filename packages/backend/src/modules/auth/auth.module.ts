import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModule } from '../user/user.module'
import { AuthController } from './api/auth.controller'
import { AuthService } from './core/application/services/auth.service'
import type { Configuration } from '../../common/config'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './infrastructure/strategies'

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<Configuration>) => ({
        secret: configService.getOrThrow('jwt.secret', { infer: true }),
        signOptions: {
          expiresIn: configService.getOrThrow('jwt.expiresIn', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
