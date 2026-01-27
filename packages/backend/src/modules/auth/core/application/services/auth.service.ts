import { Injectable, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UserService } from '../../../../user/core/application/services/user.service'
import type { UserDto, SignInRequest, SignUpRequest } from '@easy-auth/shared'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Configuration } from '../../../../../common/config'

const SALT_ROUNDS = 10

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<Configuration>,
    private userService: UserService,
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

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await this.userService.create({
      email,
      name,
      passwordHash: hashedPassword,
    })

    return {
      id: user.id,
    }
  }

  async signIn(signInDto: SignInRequest): Promise<{ jwt: string }> {
    try {
      const { email, password } = signInDto

      const user = await this.userService.findByEmail(email)

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password || '',
      )
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials')
      }

      const sharedUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }

      const accessToken = await this.generateAccessToken(sharedUser)

      return {
        jwt: accessToken,
      }
    } catch {
      throw new UnauthorizedException('Invalid credentials')
    }
  }
}
