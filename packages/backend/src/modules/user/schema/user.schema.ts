import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type UserDocument = HydratedDocument<User>

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, { _id, __v, ...rest }) => ({ id: _id, ...rest }),
  },
})
export class User {
  @Prop({ required: true, unique: true, index: true })
  email: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  password: string

  createdAt: Date
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User)
