import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserRepository } from '../../user/repositories/user.repository'
import { UserDto } from '@easy-auth/shared'
import type { ConfigType } from '@nestjs/config'
import jwtConfig from '../../../config/jwt.config'

export interface JwtPayload {
  sub: string
  iat: number
  exp: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    config: ConfigType<typeof jwtConfig>,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.secret!,
    })
  }

  async validate(payload: JwtPayload): Promise<UserDto> {
    const user = await this.userRepository.findById(payload.sub)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
