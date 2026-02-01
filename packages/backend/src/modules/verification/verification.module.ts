import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  VerificationTokenEntity,
  VerificationTokenSchema,
} from './entities/verification-token.entity'
import { VerificationTokenRepository } from './repositories/verification-token.repository'
import { VerificationService } from './services/verification.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: VerificationTokenEntity.name,
        schema: VerificationTokenSchema,
      },
    ]),
  ],
  providers: [VerificationTokenRepository, VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
