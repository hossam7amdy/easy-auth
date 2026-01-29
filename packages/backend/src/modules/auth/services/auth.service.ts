import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UserRepository } from '../../user/repositories/user.repository'
import type { UserDto, SignInRequest, SignUpRequest } from '@easy-auth/shared'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Configuration } from '../../../common/config'

const SALT_ROUNDS = 10

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<Configuration>,
    private userRepository: UserRepository,
  ) {}

  private async generateAccessToken(user: UserDto): Promise<string> {
    const payload = { sub: user.id, email: user.email }

    const accessToken = this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow('jwt.secret', {
        infer: true,
      }),
      expiresIn: this.configService.getOrThrow('jwt.expiresIn', {
        infer: true,
      }),
    })

    return accessToken
  }

  async signUp(signUpDto: SignUpRequest): Promise<{ id: string }> {
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
    }
  }

  async signIn(signInDto: SignInRequest): Promise<{ jwt: string }> {
    const { email, password } = signInDto

    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const accessToken = await this.generateAccessToken(user)

    return {
      jwt: accessToken,
    }
  }
}
