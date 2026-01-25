import { NestFactory } from '@nestjs/core'
import helmet from 'helmet'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { HttpExceptionFilter } from './common/filters'
import { LoggingInterceptor } from './common/interceptors'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      json: process.env.NODE_ENV === 'production',
    }),
  })

  app.use(helmet())

  const configService = app.get(ConfigService)

  app.enableCors({
    origin: configService.get<string>('frontend.url'),
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

  const config = new DocumentBuilder()
    .setTitle('Easy Auth API')
    .setDescription('The Easy Auth API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = configService.get<number>('port')!
  await app.listen(port)

  logger.log(`Application is running on: http://localhost:${port}`)
  logger.log(`Swagger documentation: http://localhost:${port}/api`)
}

void bootstrap()
