import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)

  app.enableCors({
    origin: configService.get<string>('frontend.url'),
  })

  const config = new DocumentBuilder()
    .setTitle('Easy Auth API')
    .setDescription('The Easy Auth API description')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  const port = configService.get<number>('port')!
  await app.listen(port)

  logger.log(`Application is running on: http://localhost:${port}`)
  logger.log(`Swagger documentation: http://localhost:${port}/api`)
}

void bootstrap()
