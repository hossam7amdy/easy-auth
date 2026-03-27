import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ConfigModule, ConfigType } from '@nestjs/config'
import envValidator from './config/env.validator'
import { MongooseModule } from '@nestjs/mongoose'
import { HealthCheckModule } from './modules/health-check/health-check.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { EmailModule } from './modules/email/email.module'
import appConfig from './config/app.config'
import databaseConfig from './config/database.config'
import jwtConfig from './config/jwt.config'
import mailerConfig from './config/mailer.config'
import throttlerConfig from './config/throttler.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        jwtConfig,
        mailerConfig,
        throttlerConfig,
      ],
      validate: envValidator,
    }),
    MongooseModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        uri: config.mongodbUri,
      }),
    }),
    HealthCheckModule,
    UserModule,
    AuthModule,
    EmailModule,
    ThrottlerModule.forRootAsync({
      inject: [throttlerConfig.KEY],
      useFactory: (config: ConfigType<typeof throttlerConfig>) => ({
        throttlers: [
          {
            name: 'default',
            ttl: config.default.ttl,
            limit: config.default.limit,
          },
        ],
      }),
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
