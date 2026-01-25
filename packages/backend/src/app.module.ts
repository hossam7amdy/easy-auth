import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { ConfigModule, ConfigService } from '@nestjs/config'
import configuration, { Configuration, validate } from './common/config'
import { MongooseModule } from '@nestjs/mongoose'
import { HealthCheckModule } from './modules/health-check/health-check.module'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<Configuration>) => ({
        uri: configService.getOrThrow('database.uri', { infer: true }),
      }),
      inject: [ConfigService],
    }),
    HealthCheckModule,
    UserModule,
    AuthModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Configuration>) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.getOrThrow('throttler.default.ttl', {
              infer: true,
            }),
            limit: configService.getOrThrow('throttler.default.limit', {
              infer: true,
            }),
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
