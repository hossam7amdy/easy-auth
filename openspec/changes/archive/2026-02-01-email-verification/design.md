## Context

The system currently allows users to sign up with any email address without verification. Users become fully active immediately after signup. This creates risk of spam accounts, impersonation, and prevents future email-dependent features.

**Current state:**
- `UserEntity`: email, name, password, createdAt, updatedAt
- Sign-up creates active user immediately
- Sign-in returns JWT for any valid credentials
- No email infrastructure exists

**Constraints:**
- Must support local development without external email service
- Must be infrastructure-agnostic for production flexibility
- Breaking change: existing users need migration strategy

## Goals / Non-Goals

**Goals:**
- Block sign-in for unverified users
- Provide infrastructure-agnostic email service
- Enable local email testing via Mailpit
- Support production email via Resend
- Rate-limit verification requests to prevent abuse

**Non-Goals:**
- Password reset flow (future capability)
- Email change verification (future capability)
- Multiple email addresses per user
- SMS verification alternative

## Decisions

### 1. Separate VerificationToken collection vs inline on User

**Decision:** Separate `VerificationToken` collection

**Alternatives considered:**
- Inline fields on User (`verificationToken`, `tokenExpiry`) - simpler but clutters User model
- Redis-based tokens - faster but adds infrastructure dependency

**Rationale:**
- Clean separation of concerns
- Reusable for future token types (password reset, email change)
- Easier to query and clean up expired tokens
- No additional infrastructure beyond MongoDB

**Schema:**
```
VerificationTokenEntity {
  token: string (unique, indexed)
  userId: ObjectId (ref: User, indexed)
  type: 'email_verification' | 'password_reset' | ...
  expiresAt: Date (indexed for TTL)
  createdAt: Date
}
```

---

### 2. Token format: UUID vs short code vs JWT

**Decision:** UUID v4

**Alternatives considered:**
- Short numeric code (847293) - user-friendly but collision risk, harder to validate format
- Signed JWT - self-contained but longer URLs, overkill for one-time use

**Rationale:**
- UUID v4 provides sufficient entropy (122 bits)
- Standard format, easy to generate with `crypto.randomUUID()`
- No cryptographic overhead
- Clean URLs: `/verify-email?token=550e8400-e29b-41d4-a716-446655440000`

---

### 3. Email service: Nodemailer with config pass-through

**Decision:** Single nodemailer service with SMTP config passed directly from environment

**Alternatives considered:**
- Factory pattern with separate adapters per provider - over-engineered for this use case
- Resend SDK - adds dependency when Resend supports SMTP

**Implementation:**
```typescript
@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private config: ConfigService) {
    this.transporter = createTransport(config.get('email.smtp'));
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    await this.transporter.sendMail(options);
  }
}
```

**Module structure:**
```
EmailModule
├── email.module.ts
├── email.service.ts          # Single service, config-driven
└── templates/
    └── verification.template.ts
```

**Rationale:**
- Nodemailer supports well-known services (SendGrid, SES, etc.) and raw SMTP
- Zero conditional logic - just pass config directly
- Switch providers by changing env vars only
- Resend supports SMTP (`smtp.resend.com:465`)
- One dependency (nodemailer) instead of multiple SDKs

---

### 4. Rate limiting approach

**Decision:** Use existing ThrottlerModule with per-endpoint override

**Configuration:**
- Global: 10 requests / 60 seconds (existing)
- Resend endpoint: 3 requests / 300 seconds (5 min)

**Implementation:**
```typescript
@Throttle({ resend: { ttl: 300000, limit: 3 } })
@Post('resend-verification')
```

**Rationale:**
- Leverages existing infrastructure
- No additional dependencies
- Per-IP tracking sufficient for this use case

---

### 5. Sign-in blocking mechanism

**Decision:** Check `isEmailVerified` in AuthService.signIn()

**Flow:**
1. Validate credentials (existing)
2. Check `user.isEmailVerified`
3. If false → throw `ForbiddenException('Email not verified')`
4. If true → generate JWT (existing)

**Note:** Email verification does NOT auto-login users. After verification, users must explicitly sign in.

**Rationale:**
- Minimal change to existing flow
- Clear error message for users
- Guard-based approach considered but over-engineering for single check

---

### 6. Async email sending

**Decision:** Fire-and-forget with error logging

**Implementation:**
```typescript
// In signUp method
await this.userRepository.create(userData);
await this.verificationService.createToken(userId);

// Fire-and-forget, don't await
this.emailService.sendVerificationEmail(email, token).catch((err) => {
  this.logger.error('Failed to send verification email', err);
});

return { id: userId, message: 'Check your email to verify your account' };
```

**Rationale:**
- Signup should not fail if email fails
- User can use resend endpoint
- Keeps signup response fast
- Error logged for debugging

**Alternative considered:** Queue-based (BullMQ) - overkill for current scale

---

### 7. Token cleanup strategy

**Decision:** Lazy deletion + MongoDB TTL index

**Implementation:**
- TTL index on `expiresAt` field (MongoDB auto-deletes)
- Delete on successful verification
- Delete old tokens on resend

**Rationale:**
- Zero maintenance
- No cron jobs needed
- MongoDB handles cleanup automatically

---

## Module Structure

```
packages/backend/src/modules/
├── auth/
│   ├── controllers/
│   │   └── auth.controller.ts    # Add: verify-email, resend-verification
│   ├── services/
│   │   └── auth.service.ts       # Add: verification logic, block unverified
│   └── dto/
│       ├── verify-email.dto.ts   # NEW
│       └── resend.dto.ts         # NEW
│
├── email/                         # NEW MODULE
│   ├── email.module.ts
│   ├── email.service.ts          # Nodemailer with config pass-through
│   └── templates/
│       └── verification.template.ts
│
├── verification/                  # NEW MODULE
│   ├── verification.module.ts
│   ├── entities/
│   │   └── verification-token.entity.ts
│   ├── repositories/
│   │   └── verification-token.repository.ts
│   └── services/
│       └── verification.service.ts
│
└── user/
    └── entities/
        └── user.entity.ts        # Add: isEmailVerified field
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| **Breaking change:** Existing users blocked from sign-in | Migration: Set `isEmailVerified: true` for all existing users |
| **Email deliverability:** Verification emails land in spam | Use Resend's verified domain; include plain text version |
| **Token enumeration:** Attacker guesses valid tokens | UUID v4 has 2^122 combinations; rate limiting on endpoint |
| **Resend abuse:** Spam victim's inbox | 3 req / 5 min limit; silent response prevents enumeration |
| **Email service failure:** Users can't verify | Resend endpoint available; fire-and-forget with retry option |

## Migration Plan

### Database Migration
1. Add `isEmailVerified: false` field to UserEntity schema
2. Run one-time script: `db.users.updateMany({}, { $set: { isEmailVerified: true } })`
3. Add TTL index on VerificationToken.expiresAt

### Rollback Strategy
1. Remove `isEmailVerified` check from signIn
2. Keep email infrastructure (no harm)
3. If needed: `db.users.updateMany({}, { $unset: { isEmailVerified: 1 } })`

## Environment Variables

```bash
# Email configuration (passed directly to nodemailer)
EMAIL_FROM=noreply@localhost

# Local dev (Mailpit - no auth needed)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false

# Production (Resend via SMTP)
# SMTP_HOST=smtp.resend.com
# SMTP_PORT=465
# SMTP_SECURE=true
# SMTP_USER=resend
# SMTP_PASS=re_xxxx
```

## API Changes

| Method | Endpoint | Changes |
|--------|----------|---------|
| POST | /api/v1/signup | Returns `{ id }` (message handled by frontend) |
| POST | /api/v1/signin | Returns 403 if `isEmailVerified: false` |
| POST | /api/v1/verify-email | **NEW** - Verifies token, sets `isEmailVerified: true`, returns `{ success: true }` |
| POST | /api/v1/resend-verification | **NEW** - Rate-limited, always returns `{ success: true }` (silent response) |
