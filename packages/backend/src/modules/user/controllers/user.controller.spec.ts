import { Test, TestingModule } from '@nestjs/testing'
import { UserController } from './user.controller'
import { CurrentUserDto } from '../dto/get-current-user.dto'
import { HttpResponse } from '../../../common/http'

describe('UserController', () => {
  let controller: UserController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
    }).compile()

    controller = module.get<UserController>(UserController)
  })

  describe('getProfile', () => {
    it('should return the current user profile', () => {
      const mockUser: CurrentUserDto = {
        id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        name: 'Test User',
        isEmailVerified: true,
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01'),
      }

      const result = controller.getProfile(mockUser)

      expect(result).toEqual(new HttpResponse(mockUser))
    })
  })
})
