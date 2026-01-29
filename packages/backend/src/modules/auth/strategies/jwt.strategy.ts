import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserRepository } from '../../user/repositories/user.repository'
import type { Configuration } from '../../../common/config/configuration'
import { UserDto } from '@easy-auth/shared'

export interface JwtPayload {
  sub: string
  iat: number
  exp: number
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<Configuration>,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt.secret', {
        infer: true,
      }),
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
