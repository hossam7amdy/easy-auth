import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException } from '@nestjs/common'
import { VerificationService } from './verification.service'
import { VerificationTokenRepository } from '../repositories/verification-token.repository'

describe('VerificationService', () => {
  let service: VerificationService
  let repository: VerificationTokenRepository

  const mockRepository = {
    create: jest.fn(),
    findByToken: jest.fn(),
    deleteByToken: jest.fn(),
    deleteAllByUserId: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerificationService,
        {
          provide: VerificationTokenRepository,
          useValue: mockRepository,
        },
      ],
    }).compile()

    service = module.get<VerificationService>(VerificationService)
    repository = module.get<VerificationTokenRepository>(
      VerificationTokenRepository,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('createToken', () => {
    it('should create a verification token successfully', async () => {
      const userId = '507f1f77bcf86cd799439011'
      mockRepository.deleteAllByUserId.mockResolvedValue(undefined)
      mockRepository.create.mockResolvedValue({
        token: expect.any(String),
        userId,
        type: 'email_verification',
        expiresAt: expect.any(Date),
      })

      const token = await service.createToken(userId)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(mockRepository.deleteAllByUserId).toHaveBeenCalledWith(userId)
      expect(mockRepository.create).toHaveBeenCalledWith({
        token: expect.any(String),
        userId,
        type: 'email_verification',
        expiresAt: expect.any(Date),
      })
    })

    it('should delete existing tokens before creating new one', async () => {
      const userId = '507f1f77bcf86cd799439011'
      mockRepository.deleteAllByUserId.mockResolvedValue(undefined)
      mockRepository.create.mockResolvedValue({})

      await service.createToken(userId)

      expect(mockRepository.deleteAllByUserId).toHaveBeenCalledWith(userId)
      expect(mockRepository.create).toHaveBeenCalled()
    })
  })

  describe('validateToken', () => {
    it('should validate a valid token successfully', async () => {
      const token = 'valid-token-123'
      const userId = '507f1f77bcf86cd799439011'
      const futureDate = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

      mockRepository.findByToken.mockResolvedValue({
        token,
        userId,
        expiresAt: futureDate,
      })

      const result = await service.validateToken(token)

      expect(result).toEqual({ userId })
      expect(mockRepository.findByToken).toHaveBeenCalledWith(token)
    })

    it('should throw error for non-existent token', async () => {
      const token = 'invalid-token'
      mockRepository.findByToken.mockResolvedValue(null)

      await expect(service.validateToken(token)).rejects.toThrow(
        BadRequestException,
      )
      await expect(service.validateToken(token)).rejects.toThrow(
        'Invalid or expired verification token',
      )
    })

    it('should throw error and delete expired token', async () => {
      const token = 'expired-token'
      const userId = '507f1f77bcf86cd799439011'
      const pastDate = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago

      mockRepository.findByToken.mockResolvedValue({
        token,
        userId,
        expiresAt: pastDate,
      })
      mockRepository.deleteByToken.mockResolvedValue(undefined)

      await expect(service.validateToken(token)).rejects.toThrow(
        BadRequestException,
      )
      expect(mockRepository.deleteByToken).toHaveBeenCalledWith(token)
    })
  })

  describe('deleteToken', () => {
    it('should delete a token successfully', async () => {
      const token = 'token-to-delete'
      mockRepository.deleteByToken.mockResolvedValue(undefined)

      await service.deleteToken(token)

      expect(mockRepository.deleteByToken).toHaveBeenCalledWith(token)
    })
  })

  describe('deleteTokensForUser', () => {
    it('should delete all tokens for a user', async () => {
      const userId = '507f1f77bcf86cd799439011'
      mockRepository.deleteAllByUserId.mockResolvedValue(undefined)

      await service.deleteTokensForUser(userId)

      expect(mockRepository.deleteAllByUserId).toHaveBeenCalledWith(userId)
    })
  })
})
