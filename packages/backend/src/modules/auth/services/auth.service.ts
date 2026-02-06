import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { UserRepository } from '../../user/repositories/user.repository'
import type {
  UserDto,
  SignInRequest,
  SignUpRequest,
  ChangePasswordRequest,
} from '@easy-auth/shared'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Configuration } from '../../../common/config'
import { EmailService } from '../../email/services/email.service'
import { VerificationService } from '../../verification/services/verification.service'
import { getVerificationEmailTemplate } from '../../email/templates/verification.template'

const SALT_ROUNDS = 10

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<Configuration>,
    private userRepository: UserRepository,
    private emailService: EmailService,
    private verificationService: VerificationService,
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

  private sendVerificationEmail(
    user: { email: string; name: string },
    token: string,
  ): void {
    const frontendUrl = this.configService.getOrThrow('frontend.url', {
      infer: true,
    })
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`

    const emailTemplate = getVerificationEmailTemplate({
      name: user.name,
      verificationLink,
    })

    this.emailService
      .sendMail({
        to: user.email,
        subject: 'Verify your email address',
        ...emailTemplate,
      })
      .catch((error) => {
        this.logger.error(
          `Failed to send verification email to ${user.email}`,
          error,
        )
      })
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

    const token = await this.verificationService.createToken(user.id)

    this.sendVerificationEmail(user, token)

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

    if (!user.isEmailVerified) {
      throw new ForbiddenException('Email not verified')
    }

    const accessToken = await this.generateAccessToken(user)

    return {
      jwt: accessToken,
    }
  }

  async verifyEmail(token: string): Promise<{ success: boolean }> {
    const { userId } = await this.verificationService.validateToken(token)

    await this.userRepository.update(userId, {
      isEmailVerified: true,
    })

    await this.verificationService.deleteToken(token)

    return { success: true }
  }

  async resendVerification(email: string): Promise<{ success: boolean }> {
    // Always return success to prevent email enumeration
    // Silent no-op if user doesn't exist or is already verified
    const user = await this.userRepository.findByEmail(email)

    if (!user || user.isEmailVerified) {
      return { success: true }
    }

    const token = await this.verificationService.createToken(user.id)

    this.sendVerificationEmail(user, token)

    return { success: true }
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordRequest,
  ): Promise<{ success: boolean }> {
    const { currentPassword, newPassword } = changePasswordDto

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    )
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect')
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from the current password',
      )
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS)

    await this.userRepository.update(userId, {
      password: hashedNewPassword,
    })

    return { success: true }
  }
}
