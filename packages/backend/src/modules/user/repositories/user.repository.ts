import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { UserEntity, UserDocument } from '../entities/user.entity'

export interface CreateUserData {
  email: string
  name: string
  password: string
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserEntity.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: { $eq: email } }).exec()
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec()
  }

  async create(data: CreateUserData): Promise<UserDocument> {
    const user = new this.userModel(data)
    return user.save()
  }
}
