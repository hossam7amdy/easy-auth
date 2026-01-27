import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  UserEntity,
  UserSchema,
} from './infrastructure/persistence/schemas/user.schema'
import { UserRepositoryPort } from './core/application/ports/user.repository.port'
import { UserMongoRepository } from './infrastructure/persistence/user.mongo.repository'
import { UserService } from './core/application/services/user.service'
import { UserController } from './api/user.controller'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserEntity.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: UserRepositoryPort,
      useClass: UserMongoRepository,
    },
  ],
  exports: [UserService],
})
export class UserModule {}
