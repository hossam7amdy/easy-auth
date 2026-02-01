## 1. Infrastructure Setup

- [x] 1.1 Add Mailpit service to docker-compose.yml (ports 8025, 1025)
- [x] 1.2 Install nodemailer dependency in backend package
- [x] 1.3 Add email configuration to configuration.ts (smtp host, port, secure, user, pass, from)
- [x] 1.4 Add email config validation to config.validation.ts
- [x] 1.5 Update .env.template with email environment variables

## 2. Email Module

- [x] 2.1 Create EmailModule with EmailService
- [x] 2.2 Implement EmailService with nodemailer transporter (config pass-through)
- [x] 2.3 Create verification email template (HTML + plain text, 15-min expiry notice)
- [x] 2.4 Export EmailModule and register in AppModule

## 3. Verification Module

- [x] 3.1 Create VerificationTokenEntity (token, userId, type, expiresAt, createdAt)
- [x] 3.2 Add TTL index on expiresAt field for automatic cleanup
- [x] 3.3 Create VerificationTokenRepository with CRUD methods
- [x] 3.4 Create VerificationService (createToken, validateToken, deleteTokensForUser)
- [x] 3.5 Create VerificationModule and export service

## 4. User Entity Update

- [x] 4.1 Add isEmailVerified field to UserEntity (default: false)
- [x] 4.2 Update UserRepository if needed for verification status queries

## 5. Auth Module Updates

- [x] 5.1 Create VerifyEmailDto and ResendVerificationDto
- [x] 5.2 Update signUp to generate token and send verification email (fire-and-forget)
- [x] 5.3 Update signUp response to include verification message
- [x] 5.4 Update signIn to check isEmailVerified, throw 403 if false
- [x] 5.5 Add POST /api/v1/verify-email endpoint (validate token, set verified, delete token, return { success: true })
- [x] 5.6 Add POST /api/v1/resend-verification endpoint with rate limiting (3 req / 5 min, always return { success: true })
- [x] 5.7 Import VerificationModule and EmailModule into AuthModule

## 6. Testing

- [x] 6.1 Add unit tests for EmailService
- [x] 6.2 Add unit tests for VerificationService
- [x] 6.3 Add unit tests for AuthService (signUp with email, signIn blocking)
- [x] 6.4 Add unit tests for AuthController (verify-email, resend-verification)
- [x] 6.5 Add e2e tests for full verification flow
- [x] 6.6 Add e2e tests for resend rate limiting

## 7. Documentation & Cleanup

- [x] 7.1 Update README with email verification setup instructions
- [x] 7.2 Document migration steps for existing users (set isEmailVerified: true)
