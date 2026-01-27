import { User } from '../../domain/user.model'

export interface CreateUserProps {
  email: string
  name: string
  passwordHash: string
}

export abstract class UserRepositoryPort {
  abstract findById(id: string): Promise<User | null>
  abstract findByEmail(email: string): Promise<User | null>
  abstract create(user: User): Promise<User>
}
