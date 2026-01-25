import { Module } from '@nestjs/common'
import { JwtModule, JwtSignOptions } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UserModule } from '../user/user.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import type { Configuration } from '../../common/config'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies'

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
          expiresIn: configService.getOrThrow<JwtSignOptions['expiresIn']>(
            'jwt.expires',
            {
              infer: true,
            },
          ),
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
