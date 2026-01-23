import { Test, TestingModule } from '@nestjs/testing'
import { HealthCheckController } from './health-check.controller'
import { HttpResponse } from '../../common/http'

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

      const expected = new HttpResponse({
        status: 'ok 🚀',
        timestamp: expect.any(String),
        service: 'easy-auth-backend',
      })

      expect(result).toEqual(expected)
    })
  })
})
