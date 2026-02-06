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

  describe(`${ENDPOINT_CONFIGS.signup.method.toUpperCase()} ${ENDPOINT_CONFIGS.signup.path}`, () => {
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

  describe(`${ENDPOINT_CONFIGS.signin.method.toUpperCase()} ${ENDPOINT_CONFIGS.signin.path}`, () => {
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

    it('should return 403 for unverified email', async () => {
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: validUser.email,
          password: validUser.password,
        })
        .expect(403)

      expect(response.body.message).toBe('Email not verified')
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

  describe('Email Verification Flow', () => {
    const testUser = {
      email: 'verify@example.com',
      name: 'Verify User',
      password: 'SecureP@ss1',
    }

    it('should complete full verification flow', async () => {
      // 1. Sign up creates user
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(testUser)
        .expect(201)

      // 2. Get verification token from database (simulating email click)
      const tokenDoc = await connection
        .collection('verification_tokens')
        .findOne({ type: 'email_verification' })
      expect(tokenDoc).toBeTruthy()
      const token = tokenDoc!.token

      // 3. Verify email with token
      const verifyResponse = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.verifyEmail.path)
        .send({ token })
        .expect(200)

      expect(verifyResponse.body.data).toEqual({ success: true })

      // 4. Token should be deleted after verification
      const deletedToken = await connection
        .collection('verification_tokens')
        .findOne({ token })
      expect(deletedToken).toBeNull()

      // 5. User should be marked as verified
      const user = await connection
        .collection('users')
        .findOne({ email: testUser.email })
      expect(user!.isEmailVerified).toBe(true)

      // 6. Now signin should work
      const signinResponse = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)

      expect(signinResponse.body.data).toHaveProperty('jwt')
    })

    it('should reject invalid verification token', async () => {
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.verifyEmail.path)
        .send({ token: 'invalid-token-uuid' })
        .expect(400)

      expect(response.body.message).toBe(
        'Invalid or expired verification token',
      )
    })

    it('should reject expired verification token', async () => {
      // Create user
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(testUser)
        .expect(201)

      // Get token and manually set it as expired
      const tokenDoc = await connection
        .collection('verification_tokens')
        .findOne({ type: 'email_verification' })
      const token = tokenDoc!.token

      // Update expiry to past date
      await connection.collection('verification_tokens').updateOne(
        { token },
        { $set: { expiresAt: new Date(Date.now() - 1000) } }, // 1 second ago
      )

      // Try to verify with expired token
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.verifyEmail.path)
        .send({ token })
        .expect(400)

      expect(response.body.message).toBe(
        'Invalid or expired verification token',
      )
    })
  })

  describe(`${ENDPOINT_CONFIGS.resendVerification.method.toUpperCase()} ${ENDPOINT_CONFIGS.resendVerification.path}`, () => {
    const testUser = {
      email: 'resend@example.com',
      name: 'Resend User',
      password: 'SecureP@ss1',
    }

    it('should resend verification email for unverified user', async () => {
      // Create user
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(testUser)
        .expect(201)

      // Delete the original token
      await connection
        .collection('verification_tokens')
        .deleteMany({ type: 'email_verification' })

      // Resend verification
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.resendVerification.path)
        .send({ email: testUser.email })
        .expect(200)

      expect(response.body.data).toEqual({ success: true })

      // New token should exist
      const newToken = await connection
        .collection('verification_tokens')
        .findOne({ type: 'email_verification' })
      expect(newToken).toBeTruthy()
    })

    it('should resend verification email for unverified user', async () => {
      // Create and verify user
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(testUser)
        .expect(201)

      const tokenDoc = await connection
        .collection('verification_tokens')
        .findOne({ type: 'email_verification' })
      const token = tokenDoc!.token

      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.verifyEmail.path)
        .send({ token })
        .expect(200)

      // Try to resend - should return success but not create new token
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.resendVerification.path)
        .send({ email: testUser.email })
        .expect(200)

      expect(response.body.data).toEqual({ success: true })

      // No verification token should exist for verified user
      const noToken = await connection
        .collection('verification_tokens')
        .findOne({ type: 'email_verification' })
      expect(noToken).toBeNull()
    })

    it('should return success for non-existent user (security)', async () => {
      const response = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.resendVerification.path)
        .send({ email: 'nonexistent@example.com' })
        .expect(200)

      expect(response.body.data).toEqual({ success: true })
    })
  })

  describe(`${ENDPOINT_CONFIGS.changePassword.method.toUpperCase()} ${ENDPOINT_CONFIGS.changePassword.path}`, () => {
    const testUser = {
      email: 'changepass@example.com',
      name: 'Change Pass User',
      password: 'OldP@ss1',
    }

    let authToken: string

    beforeEach(async () => {
      // Create and verify user
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signup.path)
        .send(testUser)
        .expect(201)

      // Get verification token and verify
      const tokenDoc = await connection
        .collection('verification_tokens')
        .findOne({ type: 'email_verification' })
      const verificationToken = tokenDoc!.token

      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.verifyEmail.path)
        .send({ token: verificationToken })
        .expect(200)

      // Sign in to get JWT
      const signinResponse = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)

      authToken = signinResponse.body.data.jwt
    })

    it('should successfully change password with valid current password', async () => {
      const changePasswordData = {
        currentPassword: testUser.password,
        newPassword: 'NewP@ss2',
      }

      const response = await request(app.getHttpServer())
        .put(ENDPOINT_CONFIGS.changePassword.path)
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordData)
        .expect(200)

      expect(response.body.data).toEqual({ success: true })
    })

    it('should return 401 when no authentication token provided', async () => {
      const changePasswordData = {
        currentPassword: testUser.password,
        newPassword: 'NewP@ss2',
      }

      await request(app.getHttpServer())
        .put(ENDPOINT_CONFIGS.changePassword.path)
        .send(changePasswordData)
        .expect(401)
    })

    it('should return 400 when current password is incorrect', async () => {
      const changePasswordData = {
        currentPassword: 'WrongP@ss1',
        newPassword: 'NewP@ss2',
      }

      const response = await request(app.getHttpServer())
        .put(ENDPOINT_CONFIGS.changePassword.path)
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordData)
        .expect(400)

      expect(response.body.message).toBe('Current password is incorrect')
    })

    it('should return 400 for weak new password', async () => {
      const changePasswordData = {
        currentPassword: testUser.password,
        newPassword: 'weak',
      }

      const response = await request(app.getHttpServer())
        .put(ENDPOINT_CONFIGS.changePassword.path)
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordData)
        .expect(400)

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Password must be at least 8 characters'),
        ]),
      )
    })

    it('should allow signin with new password after successful change', async () => {
      const newPassword = 'NewP@ss2'

      // Change password
      await request(app.getHttpServer())
        .put(ENDPOINT_CONFIGS.changePassword.path)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword,
        })
        .expect(200)

      // Try signin with old password - should fail
      await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401)

      // Try signin with new password - should succeed
      const signinResponse = await request(app.getHttpServer())
        .post(ENDPOINT_CONFIGS.signin.path)
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200)

      expect(signinResponse.body.data).toHaveProperty('jwt')
    })

    it('should return 400 for missing currentPassword field', async () => {
      const response = await request(app.getHttpServer())
        .put(ENDPOINT_CONFIGS.changePassword.path)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          newPassword: 'NewP@ss2',
        })
        .expect(400)

      expect(response.body.message).toContain('Current password is required')
    })

    it('should return 400 for missing newPassword field', async () => {
      const response = await request(app.getHttpServer())
        .put(ENDPOINT_CONFIGS.changePassword.path)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
        })
        .expect(400)

      expect(response.body.message).toContain('Password is required')
    })
  })
})
