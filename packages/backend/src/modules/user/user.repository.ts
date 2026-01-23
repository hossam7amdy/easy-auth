import { Model } from 'mongoose'
import { User } from '@easy-auth/shared'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User as UserSchema, UserDocument } from './schema/user.schema'

export interface CreateUserData {
  email: string
  name: string
  password: string
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserSchema.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec()
  }

  async create(data: CreateUserData): Promise<User> {
    const user = new this.userModel(data)
    return user.save()
  }
}
