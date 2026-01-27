import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import {
  UserRepositoryPort,
  CreateUserProps,
} from '../ports/user.repository.port'
import { User } from '../../domain/user.model'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepositoryPort) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`)
    }

    return user
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) {
      throw new NotFoundException(`User with email "${email}" not found`)
    }

    return user
  }

  async create(data: CreateUserProps): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email)

    if (existingUser) {
      throw new ConflictException('A user with this email already exists')
    }

    const user = User.create({
      email: data.email,
      name: data.name,
      password: data.passwordHash,
    })

    return this.userRepository.create(user)
  }
}
