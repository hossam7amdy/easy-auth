import { Test, TestingModule } from '@nestjs/testing'
import { HealthCheckController } from './health-check.controller'

describe('HealthCheckController', () => {
  let controller: HealthCheckController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthCheckController],
    }).compile()

    controller = module.get<HealthCheckController>(HealthCheckController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('check', () => {
    it('should return health status', () => {
      const result = controller.check()
      expect(result).toEqual({
        status: 'ok 🚀',
        timestamp: expect.any(String),
        service: 'easy-auth-backend',
      })
    })
  })
})
