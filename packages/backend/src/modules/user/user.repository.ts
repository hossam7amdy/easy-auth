import { Model } from 'mongoose'
import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { User, UserDocument } from './schema/user.schema'

export interface CreateUserData {
  email: string
  name: string
  password: string
}

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec()
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec()
  }

  async create(data: CreateUserData): Promise<UserDocument> {
    const user = new this.userModel(data)
    return user.save()
  }
}
