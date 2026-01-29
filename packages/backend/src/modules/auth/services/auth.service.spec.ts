import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException, UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { UserRepository } from '../../user/repositories/user.repository'

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
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    }

    const mockJwtService = {
      signAsync: jest.fn(),
    }

    const mockConfigService = {
      getOrThrow: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
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
  })
})
