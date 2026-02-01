## Why

Users can currently sign up with any email address without proving ownership. This allows spam accounts and impersonation. Email verification ensures account legitimacy and enables email-based features (password reset, notifications).

## What Changes

- **New: Email verification flow** - Users must verify their email before signing in
- **New: VerificationToken entity** - Separate collection for verification tokens (15-min expiry, UUID format)
- **New: Email service abstraction** - Infrastructure-agnostic email sending with SMTP adapter for local dev (Mailpit) and Resend adapter for production
- **New: Resend verification endpoint** - Rate-limited endpoint to request new verification emails
- **Modified: Sign-up flow** - Creates unverified user, generates token, sends verification email
- **Modified: Sign-in flow** - **BREAKING** - Blocks unverified users with 403 Forbidden
- **New: Docker Compose service** - Mailpit for local email testing

## Capabilities

### New Capabilities

- `email-verification`: Token generation, validation, expiration, and user verification status management
- `email-service`: Infrastructure-agnostic email sending with pluggable adapters (SMTP, Resend)

### Modified Capabilities

None - no existing specs to modify.

## Impact

- **Backend modules**: New `email/` and `verification/` modules; modified `auth/` module
- **User entity**: Add `isEmailVerified: boolean` field (defaults to `false`)
- **API endpoints**: 
  - `POST /auth/signup` - now sends verification email
  - `POST /auth/signin` - now checks verification status
  - `GET /auth/verify-email?token=xxx` - new endpoint
  - `POST /auth/resend-verification` - new endpoint (rate-limited)
- **Docker Compose**: Add Mailpit service for local development
- **Environment variables**: Email provider config, SMTP/Resend credentials
- **Frontend**: Will need verification callback page and "check your email" messaging
