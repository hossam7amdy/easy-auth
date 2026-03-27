import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { HttpExceptionFilter } from './common/filters'
import { LoggingInterceptor } from './common/interceptors'
import appConfig from './config/app.config'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: process.env.NODE_ENV === 'production',
    }),
  })

  app.use(helmet())

  const config: ConfigType<typeof appConfig> = app.get(appConfig.KEY)

  app.enableCors({
    origin: config.allowedCors,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )

  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalInterceptors(new LoggingInterceptor())

  const openApiConfig = new DocumentBuilder()
    .setTitle('Easy Auth API')
    .setDescription('The Easy Auth API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, openApiConfig)
  SwaggerModule.setup('api', app, document, {
    ui: config.nodeEnv !== 'production',
  })

  await app.listen(config.port)

  logger.log(`Application is running on: http://localhost:${config.port}`)
  logger.log(`Swagger documentation: http://localhost:${config.port}/api`)
}

void bootstrap()
