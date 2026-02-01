import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type VerificationTokenDocument =
  HydratedDocument<VerificationTokenEntity>

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'verification_tokens',
})
export class VerificationTokenEntity {
  @Prop({ required: true, unique: true, index: true })
  token: string

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'UserEntity',
    index: true,
  })
  userId: Types.ObjectId

  @Prop({ required: true, enum: ['email_verification', 'password_reset'] })
  type: string

  @Prop({ required: true })
  expiresAt: Date

  createdAt: Date
}

export const VerificationTokenSchema = SchemaFactory.createForClass(
  VerificationTokenEntity,
)

// TTL index - MongoDB auto-deletes expired tokens
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
