import { Test, TestingModule } from '@nestjs/testing'
import {
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { UserRepository } from '../../user/repositories/user.repository'
import { EmailService } from '../../email/services/email.service'
import { VerificationService } from '../../verification/services/verification.service'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService
  let userRepository: jest.Mocked<UserRepository>
  let jwtService: jest.Mocked<JwtService>
  let configService: jest.Mocked<ConfigService>

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword123',
    isEmailVerified: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  const mockUnverifiedUser = {
    ...mockUser,
    isEmailVerified: false,
  }

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }

    const mockJwtService = {
      signAsync: jest.fn(),
    }

    const mockConfigService = {
      getOrThrow: jest.fn().mockReturnValue('http://localhost:5173'),
    }

    const mockEmailService = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    }

    const mockVerificationService = {
      createToken: jest.fn().mockResolvedValue('mock-token-uuid'),
      validateToken: jest.fn(),
      deleteToken: jest.fn(),
      deleteTokensForUser: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: VerificationService, useValue: mockVerificationService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userRepository = module.get(UserRepository)
    jwtService = module.get(JwtService)
    configService = module.get(ConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('signUp', () => {
    const signUpDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecureP@ss1',
    }

    it('should create a new user with hashed password', async () => {
      userRepository.findByEmail.mockResolvedValue(null)
      userRepository.create.mockResolvedValue(mockUser as never)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123')

      const result = await service.signUp(signUpDto)

      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10)
      expect(userRepository.create).toHaveBeenCalledWith({
        email: signUpDto.email,
        name: signUpDto.name,
        password: 'hashedPassword123',
      })
      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
      })
    })

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as never)

      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException)
      await expect(service.signUp(signUpDto)).rejects.toThrow(
        'A user with this email already exists',
      )
      expect(userRepository.create).not.toHaveBeenCalled()
    })

    it('should not store plain text password', async () => {
      userRepository.findByEmail.mockResolvedValue(null)
      userRepository.create.mockResolvedValue(mockUser as never)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123')

      await service.signUp(signUpDto)

      const createCall = userRepository.create.mock.calls[0][0]
      expect(createCall.password).not.toBe(signUpDto.password)
      expect(createCall.password).toBe('hashedPassword123')
    })
  })

  describe('signIn', () => {
    const signInDto = {
      email: 'test@example.com',
      password: 'SecureP@ss1',
    }

    it('should return JWT when credentials are valid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as never)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      jwtService.signAsync.mockResolvedValue('mockToken' as never)
      configService.getOrThrow
        .mockReturnValueOnce('secret')
        .mockReturnValueOnce('1d')

      const result = await service.signIn(signInDto)

      expect(userRepository.findByEmail).toHaveBeenCalledWith(signInDto.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(
        signInDto.password,
        mockUser.password,
      )
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email },
        { secret: 'secret', expiresIn: '1d' },
      )
      expect(result).toEqual({ jwt: 'mockToken' })
    })

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findByEmail.mockResolvedValue(null)

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      )
      await expect(service.signIn(signInDto)).rejects.toThrow(
        'Invalid credentials',
      )
      expect(jwtService.signAsync).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedException when password is invalid', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as never)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      )
      await expect(service.signIn(signInDto)).rejects.toThrow(
        'Invalid credentials',
      )
      expect(jwtService.signAsync).not.toHaveBeenCalled()
    })

    it('should throw ForbiddenException when email is not verified', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUnverifiedUser as never)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      await expect(service.signIn(signInDto)).rejects.toThrow(
        ForbiddenException,
      )
      await expect(service.signIn(signInDto)).rejects.toThrow(
        'Email not verified',
      )
      expect(jwtService.signAsync).not.toHaveBeenCalled()
    })
  })

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const token = 'valid-token'
      const userId = '507f1f77bcf86cd799439011'
      const mockVerificationService = service[
        'verificationService'
      ] as jest.Mocked<VerificationService>
      const mockUserRepository = service[
        'userRepository'
      ] as jest.Mocked<UserRepository>

      mockVerificationService.validateToken.mockResolvedValue({ userId })
      mockUserRepository.update.mockResolvedValue(mockUser as never)
      mockVerificationService.deleteToken.mockResolvedValue(undefined)

      const result = await service.verifyEmail(token)

      expect(mockVerificationService.validateToken).toHaveBeenCalledWith(token)
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        isEmailVerified: true,
      })
      expect(mockVerificationService.deleteToken).toHaveBeenCalledWith(token)
      expect(result).toEqual({ success: true })
    })

    it('should throw BadRequestException for invalid token', async () => {
      const token = 'invalid-token'
      const mockVerificationService = service[
        'verificationService'
      ] as jest.Mocked<VerificationService>

      mockVerificationService.validateToken.mockRejectedValue(
        new BadRequestException('Invalid or expired verification token'),
      )

      await expect(service.verifyEmail(token)).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('resendVerification', () => {
    it('should resend verification email for unverified user', async () => {
      const email = 'test@example.com'
      const mockEmailService = service[
        'emailService'
      ] as jest.Mocked<EmailService>
      const mockVerificationService = service[
        'verificationService'
      ] as jest.Mocked<VerificationService>

      userRepository.findByEmail.mockResolvedValue(mockUnverifiedUser as never)
      mockVerificationService.createToken.mockResolvedValue('new-token')
      mockEmailService.sendMail.mockResolvedValue(undefined)

      const result = await service.resendVerification(email)

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(mockVerificationService.createToken).toHaveBeenCalledWith(
        mockUnverifiedUser.id,
      )
      expect(mockEmailService.sendMail).toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    it('should return success without sending email for verified user', async () => {
      const email = 'test@example.com'
      const mockEmailService = service[
        'emailService'
      ] as jest.Mocked<EmailService>
      const mockVerificationService = service[
        'verificationService'
      ] as jest.Mocked<VerificationService>

      userRepository.findByEmail.mockResolvedValue(mockUser as never)

      const result = await service.resendVerification(email)

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(mockVerificationService.createToken).not.toHaveBeenCalled()
      expect(mockEmailService.sendMail).not.toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })

    it('should return success without sending email for non-existent user', async () => {
      const email = 'nonexistent@example.com'
      const mockEmailService = service[
        'emailService'
      ] as jest.Mocked<EmailService>
      const mockVerificationService = service[
        'verificationService'
      ] as jest.Mocked<VerificationService>

      userRepository.findByEmail.mockResolvedValue(null)

      const result = await service.resendVerification(email)

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email)
      expect(mockVerificationService.createToken).not.toHaveBeenCalled()
      expect(mockEmailService.sendMail).not.toHaveBeenCalled()
      expect(result).toEqual({ success: true })
    })
  })

  describe('changePassword', () => {
    const userId = '507f1f77bcf86cd799439011'
    const changePasswordDto = {
      currentPassword: 'OldP@ss1',
      newPassword: 'NewP@ss2',
    }

    it('should successfully change password with valid current password', async () => {
      userRepository.findById.mockResolvedValue(mockUser as never)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword')
      userRepository.update.mockResolvedValue(mockUser as never)

      const result = await service.changePassword(userId, changePasswordDto)

      expect(userRepository.findById).toHaveBeenCalledWith(userId)
      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        mockUser.password,
      )
      expect(bcrypt.hash).toHaveBeenCalledWith(
        changePasswordDto.newPassword,
        10,
      )
      expect(userRepository.update).toHaveBeenCalledWith(userId, {
        password: 'hashedNewPassword',
      })
      expect(result).toEqual({ success: true })
    })

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findById.mockResolvedValue(null)

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException)
      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow('User not found')
      expect(bcrypt.compare).not.toHaveBeenCalled()
      expect(userRepository.update).not.toHaveBeenCalled()
    })

    it('should throw BadRequestException when current password is incorrect', async () => {
      userRepository.findById.mockResolvedValue(mockUser as never)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(BadRequestException)
      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow('Current password is incorrect')
      expect(bcrypt.hash).not.toHaveBeenCalled()
      expect(userRepository.update).not.toHaveBeenCalled()
    })

    it('should hash new password before storing', async () => {
      userRepository.findById.mockResolvedValue(mockUser as never)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword')
      userRepository.update.mockResolvedValue(mockUser as never)

      await service.changePassword(userId, changePasswordDto)

      const updateCall = userRepository.update.mock.calls[0][1]
      expect(updateCall.password).not.toBe(changePasswordDto.newPassword)
      expect(updateCall.password).toBe('hashedNewPassword')
    })
  })
})
