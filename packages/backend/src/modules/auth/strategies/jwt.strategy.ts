import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from '../../user/core/application/services/user.service'
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
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow('jwt.secret', { infer: true }),
    })
  }

  async validate(payload: JwtPayload): Promise<UserDto> {
    return this.userService.findById(payload.sub)
  }
}
