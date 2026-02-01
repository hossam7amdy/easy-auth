import { Injectable, BadRequestException } from '@nestjs/common'
import { VerificationTokenRepository } from '../repositories/verification-token.repository'

@Injectable()
export class VerificationService {
  constructor(
    private readonly verificationTokenRepository: VerificationTokenRepository,
  ) {}

  async createToken(
    userId: string,
    type: 'email_verification' | 'password_reset' = 'email_verification',
  ): Promise<string> {
    const token = crypto.randomUUID()

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await this.verificationTokenRepository.deleteAllByUserId(userId)

    await this.verificationTokenRepository.create({
      token,
      userId,
      type,
      expiresAt,
    })

    return token
  }

  async validateToken(token: string): Promise<{ userId: string }> {
    const tokenDoc = await this.verificationTokenRepository.findByToken(token)

    if (!tokenDoc) {
      throw new BadRequestException('Invalid or expired verification token')
    }

    if (tokenDoc.expiresAt < new Date()) {
      await this.verificationTokenRepository.deleteByToken(token)
      throw new BadRequestException('Invalid or expired verification token')
    }

    return { userId: tokenDoc.userId.toString() }
  }

  async deleteToken(token: string): Promise<void> {
    await this.verificationTokenRepository.deleteByToken(token)
  }

  async deleteTokensForUser(userId: string): Promise<void> {
    await this.verificationTokenRepository.deleteAllByUserId(userId)
  }
}
