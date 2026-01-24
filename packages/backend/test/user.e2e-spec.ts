import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import { Connection } from 'mongoose'
import { getConnectionToken } from '@nestjs/mongoose'

describe('User (e2e)', () => {
  let app: INestApplication
  let connection: Connection

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    )

    connection = moduleFixture.get<Connection>(getConnectionToken())
    await app.init()
  })

  afterAll(async () => {
    await connection.dropDatabase()
    await app.close()
  })

  beforeEach(async () => {
    const collections = connection.collections
    for (const key in collections) {
      await collections[key].deleteMany({})
    }
  })

  describe('GET /api/v1/users/me', () => {
    const validUser = {
      email: 'profile@example.com',
      name: 'Profile User',
      password: 'SecureP@ss1',
    }
    let jwtToken: string

    beforeEach(async () => {
      // Create a user and get JWT token
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(validUser)
        .expect(201)

      const signInResponse = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: validUser.email,
          password: validUser.password,
        })
        .expect(200)

      jwtToken = signInResponse.body.data.jwt
    })

    it('should return current user profile with valid JWT', async () => {
      const response = await request(app.getHttpServer())
        .get(ENDPOINT_CONFIGS.getCurrentUser.path)
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)

      expect(response.body.data).toEqual({
        id: expect.any(String),
        email: validUser.email,
        name: validUser.name,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      })
    })

    it('should return 401 when JWT token is missing', async () => {
      await request(app.getHttpServer())
        .get(ENDPOINT_CONFIGS.getCurrentUser.path)
        .expect(401)
    })

    it('should return 401 with invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get(ENDPOINT_CONFIGS.getCurrentUser.path)
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401)
    })

    it('should return 401 with malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get(ENDPOINT_CONFIGS.getCurrentUser.path)
        .set('Authorization', 'InvalidFormat token123')
        .expect(401)
    })
  })
})
