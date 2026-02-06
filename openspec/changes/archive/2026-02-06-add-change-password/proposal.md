## Why

Users need the ability to update their passwords for security reasons (e.g., after a potential compromise, periodic password rotation, or when they want to strengthen their credentials). Currently, the system lacks this essential security feature for authenticated users to manage their own passwords.

## What Changes

- Add a new authenticated endpoint `PUT /v1/auth/change-password` that allows users to update their password
- Implement password change business logic with current password verification
- Add validation for new password strength requirements (reusing existing password validation patterns)
- Add rate limiting/throttling to prevent abuse
- Include comprehensive DTOs for request/response validation
- Add unit and e2e tests for the password change functionality

## Capabilities

### New Capabilities
- `password-change`: Authenticated endpoint for users to change their password by providing their current password and a new password that meets validation requirements

### Modified Capabilities

(None - this is a net-new capability that doesn't modify existing spec requirements)

## Impact

**Affected Systems:**
- **Backend API**: New endpoint in `packages/backend/src/modules/auth/controllers/auth.controller.ts`
- **Auth Service**: New method in `packages/backend/src/modules/auth/services/auth.service.ts`
- **User Service**: Password update logic in `packages/backend/src/modules/user/`
- **Shared Package**: New endpoint configuration in `packages/shared/src/api.ts`

**Security Considerations:**
- Requires JWT authentication (existing)
- Validates current password before allowing change
- Applies password strength validation (consistent with signup)
- Rate limiting to prevent brute force attacks

**Testing Impact:**
- New unit tests for AuthService and AuthController
- New e2e tests for the password change endpoint
