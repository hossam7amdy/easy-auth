import { Test, TestingModule } from '@nestjs/testing'
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { AuthService } from './auth.service'
import { UserService } from '../user/core/application/services/user.service'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService
  let userService: jest.Mocked<UserService>
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
        { provide: UserService, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userService = module.get(UserService)
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
      userService.create.mockResolvedValue(mockUser as never)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123')

      const result = await service.signUp(signUpDto)

      expect(bcrypt.hash).toHaveBeenCalledWith(signUpDto.password, 10)
      expect(userService.create).toHaveBeenCalledWith({
        email: signUpDto.email,
        name: signUpDto.name,
        passwordHash: 'hashedPassword123',
      })
      expect(result).toEqual({
        id: '507f1f77bcf86cd799439011',
      })
    })

    it('should throw ConflictException when email already exists', async () => {
      userService.create.mockRejectedValue(
        new ConflictException('A user with this email already exists'),
      )

      await expect(service.signUp(signUpDto)).rejects.toThrow(ConflictException)
      await expect(service.signUp(signUpDto)).rejects.toThrow(
        'A user with this email already exists',
      )
      expect(userService.create).toHaveBeenCalledTimes(2)
    })

    it('should not store plain text password', async () => {
      userService.create.mockResolvedValue(mockUser as never)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123')

      await service.signUp(signUpDto)

      const createCall = userService.create.mock.calls[0][0]
      expect(createCall.passwordHash).not.toBe(signUpDto.password)
      expect(createCall.passwordHash).toBe('hashedPassword123')
    })
  })

  describe('signIn', () => {
    const signInDto = {
      email: 'test@example.com',
      password: 'SecureP@ss1',
    }

    it('should return JWT when credentials are valid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as never)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      jwtService.signAsync.mockResolvedValue('mockToken' as never)
      configService.getOrThrow
        .mockReturnValueOnce('secret')
        .mockReturnValueOnce('1d')

      const result = await service.signIn(signInDto)

      expect(userService.findByEmail).toHaveBeenCalledWith(signInDto.email)
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
      userService.findByEmail.mockRejectedValueOnce(new NotFoundException())

      await expect(service.signIn(signInDto)).rejects.toThrow(
        UnauthorizedException,
      )
      await expect(service.signIn(signInDto)).rejects.toThrow(
        'Invalid credentials',
      )
      expect(jwtService.signAsync).not.toHaveBeenCalled()
    })

    it('should throw UnauthorizedException when password is invalid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser as never)
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
