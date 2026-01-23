import { NestFactory } from '@nestjs/core'
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

  const port = configService.get<number>('port')!
  await app.listen(port)

  logger.log(`Application is running on: http://localhost:${port}`)
}

void bootstrap()
