import { User } from '../../../core/domain/user.model'
import { UserDocument, UserEntity } from '../schemas/user.schema'

export class UserMapper {
  static toDomain(userEntity: UserDocument | UserEntity): User {
    let id = ''
    if ('_id' in userEntity) {
      id = userEntity._id.toString()
    } else if ('id' in userEntity) {
      id = (userEntity.id as string).toString()
    }

    return User.from({
      id,
      email: userEntity.email,
      name: userEntity.name,
      password: userEntity.password,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
    })
  }

  static toPersistence(user: User): Partial<UserEntity> {
    return {
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
