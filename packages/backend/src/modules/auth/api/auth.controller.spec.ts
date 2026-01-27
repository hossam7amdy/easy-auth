import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from '../core/application/services/auth.service'
import { HttpResponse } from '../../../common/http'

describe('AuthController', () => {
  let controller: AuthController
  let authService: jest.Mocked<AuthService>

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  }

  beforeEach(async () => {
    const mockAuthService = {
      signUp: jest.fn(),
      signIn: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get(AuthService)
  })

  describe('signUp', () => {
    const signUpDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecureP@ss1',
    }

    it('should return created user wrapped in HttpResponse', async () => {
      authService.signUp.mockResolvedValue({ id: mockUser.id })

      const result = await controller.signUp(signUpDto)

      expect(authService.signUp).toHaveBeenCalledWith(signUpDto)
      expect(result).toEqual(new HttpResponse({ id: mockUser.id }))
    })
  })

  describe('signIn', () => {
    const signInDto = {
      email: 'test@example.com',
      password: 'SecureP@ss1',
    }

    it('should return JWT wrapped in HttpResponse', async () => {
      const mockJwt = { jwt: 'mockToken123' }
      authService.signIn.mockResolvedValue(mockJwt)

      const result = await controller.signIn(signInDto)

      expect(authService.signIn).toHaveBeenCalledWith(signInDto)
      expect(result).toEqual(new HttpResponse(mockJwt))
    })
  })
})
