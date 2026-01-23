import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { AuthService } from './auth.service'
import { UserRepository } from '../user/user.repository'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService
  let userRepository: jest.Mocked<UserRepository>

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userRepository = module.get(UserRepository)
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
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
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
})
