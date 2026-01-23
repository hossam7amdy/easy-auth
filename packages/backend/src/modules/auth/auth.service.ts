import { Injectable, ConflictException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UserRepository } from '../user/user.repository'
import { SignUpRequestDto } from './dto/signup.dto'
import type { User } from '@easy-auth/shared'

const SALT_ROUNDS = 10

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async signUp(signUpDto: SignUpRequestDto): Promise<User> {
    const { email, name, password } = signUpDto

    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new ConflictException('A user with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await this.userRepository.create({
      email,
      name,
      password: hashedPassword,
    })

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
