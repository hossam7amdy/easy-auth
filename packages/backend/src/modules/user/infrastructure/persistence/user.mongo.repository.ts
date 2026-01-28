import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { UserEntity, UserDocument } from './schemas/user.schema'
import { UserRepositoryPort } from '../../core/application/ports/user.repository.port'
import { User } from '../../core/domain/user.model'
import { UserMapper } from './mappers/user.mapper'

@Injectable()
export class UserMongoRepository implements UserRepositoryPort {
  constructor(
    @InjectModel(UserEntity.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email: { $eq: email } }).exec()
    if (!user) return null
    return UserMapper.toDomain(user)
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec()
    if (!user) return null
    return UserMapper.toDomain(user)
  }

  async create(userEntity: User): Promise<User> {
    const persistenceData = UserMapper.toPersistence(userEntity)
    const newUser = new this.userModel(persistenceData)
    const savedUser = await newUser.save()
    return UserMapper.toDomain(savedUser)
  }
}
