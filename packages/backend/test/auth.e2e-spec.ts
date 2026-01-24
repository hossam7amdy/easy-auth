import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import request from 'supertest'
import { AppModule } from '../src/app.module'
import { ENDPOINT_CONFIGS } from '@easy-auth/shared'
import { Connection } from 'mongoose'
import { getConnectionToken } from '@nestjs/mongoose'

describe('Auth (e2e)', () => {
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

  describe('POST /api/v1/signup', () => {
    const validSignUpData = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'SecureP@ss1',
    }

    it('should create a new user and return 201', async () => {
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(validSignUpData)
        .expect(201)

      expect(response.body.data).toEqual({
        id: expect.any(String),
      })
    })

    it('should return 409 for duplicate email', async () => {
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(validSignUpData)
        .expect(201)

      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(validSignUpData)
        .expect(409)

      expect(response.body.message).toBe(
        'A user with this email already exists',
      )
    })

    it('should return 400 for invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send({ ...validSignUpData, email: 'invalid-email' })
        .expect(400)

      expect(response.body.message).toContain(
        'Please provide a valid email address',
      )
    })

    it('should return 400 for short name', async () => {
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send({ ...validSignUpData, name: 'AB' })
        .expect(400)

      expect(response.body.message).toContain(
        'Name must be at least 3 characters long',
      )
    })

    it('should return 400 for weak password', async () => {
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send({ ...validSignUpData, password: 'weak' })
        .expect(400)

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Password must be at least 8 characters'),
        ]),
      )
    })
  })

  describe('POST /api/v1/signin', () => {
    const validUser = {
      email: 'signin@example.com',
      name: 'Signin User',
      password: 'SecureP@ss1',
    }

    beforeEach(async () => {
      // Create a user for signin
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(validUser)
        .expect(201)
    })

    it('should return JWT for valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: validUser.email,
          password: validUser.password,
        })
        .expect(200)

      expect(response.body.data).toHaveProperty('jwt')
      expect(typeof response.body.data.jwt).toBe('string')
    })

    it('should return 401 for invalid password', async () => {
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: validUser.email,
          password: 'WrongPassword123',
        })
        .expect(401)
    })

    it('should return 401 for non-existent email', async () => {
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: 'nonexistent@example.com',
          password: validUser.password,
        })
        .expect(401)
    })
  })
})
