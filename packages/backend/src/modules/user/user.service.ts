import { Injectable, NotFoundException } from '@nestjs/common'
import { UserRepository } from './user.repository'
import { User } from '@easy-auth/shared'

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`)
    }
    return user
  }
}
