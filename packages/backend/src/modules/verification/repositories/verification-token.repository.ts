import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import {
  VerificationTokenEntity,
  VerificationTokenDocument,
} from '../entities/verification-token.entity'

@Injectable()
export class VerificationTokenRepository {
  constructor(
    @InjectModel(VerificationTokenEntity.name)
    private readonly model: Model<VerificationTokenDocument>,
  ) {}

  async create(data: {
    token: string
    userId: string
    type: string
    expiresAt: Date
  }): Promise<VerificationTokenDocument> {
    const tokenEntity = new this.model(data)
    return tokenEntity.save()
  }

  async findByToken(token: string): Promise<VerificationTokenDocument | null> {
    return this.model.findOne({ token: { $eq: token } }).exec()
  }

  async deleteByToken(token: string): Promise<void> {
    await this.model.deleteOne({ token: { $eq: token } }).exec()
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.model.deleteMany({ userId: { $eq: userId } }).exec()
  }
}
