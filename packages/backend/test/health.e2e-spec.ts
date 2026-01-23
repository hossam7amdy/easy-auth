import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'

describe('Health Check (e2e)', () => {
  let app: INestApplication

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterEach(async () => {
    await app.close()
  })

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get(ENDPOINT_CONFIGS.health.path)
      .expect(200)
      .expect((res) => {
        expect(res.body).toEqual({
          status: 'ok 🚀',
          timestamp: expect.any(String),
          service: 'easy-auth-backend',
        })
      })
  })
})
