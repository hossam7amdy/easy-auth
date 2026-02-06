## Context

The easy-auth application currently supports user signup, signin, and email verification flows. Users can create accounts with passwords but have no way to update them once set. This design addresses adding password change functionality for authenticated users.

**Current State:**
- Auth system uses JWT tokens for authentication
- Passwords are hashed with bcrypt (SALT_ROUNDS = 10)
- Password validation is implemented in signup DTOs using class-validator decorators
- Rate limiting is applied to sensitive endpoints using @nestjs/throttler
- Endpoint configs are centralized in `@easy-auth/shared/src/endpoints.ts`

**Constraints:**
- Must reuse existing password validation patterns
- Must follow existing DTO/controller/service architecture
- Must maintain security standards (authenticated endpoint, rate limiting)
- Endpoints use `/v1/auth/*` pattern (no `/api` prefix)

## Goals / Non-Goals

**Goals:**
- Add authenticated password change endpoint (`PUT /v1/auth/change-password`)
- Verify current password before allowing change
- Reuse existing password validation rules from signup
- Apply rate limiting to prevent brute force attacks
- Maintain consistent API response format

**Non-Goals:**
- Password reset via email (forgot password flow) - separate feature
- Password history tracking - not needed for initial implementation
- Force password change on first login - not in scope
- Frontend implementation - backend only

## Decisions

### 1. Endpoint Method and Path
**Decision:** Use `PUT /v1/auth/change-password` with JWT authentication required

**Rationale:**
- PUT semantically correct for updating a resource (user's password)
- Follows existing `/v1/auth/*` pattern for auth-related endpoints
- Requires JWT authentication (like `/v1/users/me` endpoints)

**Alternatives Considered:**
- `PATCH /v1/users/me/password` - Considered, but auth operations belong under `/auth/*`
- `POST /v1/auth/change-password` - POST less semantically appropriate for update operation

### 2. Password Validation Reuse
**Decision:** Create a reusable password validation decorator that can be shared between SignUp and ChangePassword DTOs

**Rationale:**
- DRY principle - password rules defined once
- Ensures consistency across signup and password change
- Makes future password policy changes easier

**Implementation:** Extract password decorators into a shared decorator function in `backend/src/common/decorators/password.decorator.ts`

### 3. Current Password Verification
**Decision:** Verify current password in AuthService.changePassword() method before updating

**Rationale:**
- Security - prevents unauthorized password changes even with stolen JWT
- Follows principle of defense in depth
- User might have left device unattended with active session

**Flow:**
1. Extract userId from JWT (automatic via JwtAuthGuard)
2. Load user from database
3. Compare provided currentPassword with stored hash using bcrypt.compare()
4. If match, hash newPassword and update
5. If no match, throw BadRequestException

### 4. Same Password Prevention
**Decision:** Check if newPassword equals currentPassword and reject if true

**Rationale:**
- Prevents users from "changing" to the same password
- Forces actual password rotation for security

**Implementation:** Compare plaintext passwords before hashing (bcrypt hashes will always differ due to salts)

### 5. Rate Limiting
**Decision:** Apply throttle of 5 requests per 15 minutes

**Rationale:**
- Prevents brute force attacks on current password verification
- More restrictive than signup (which has no throttle beyond global limits)
- 15-minute window allows legitimate users to retry a few times

**Implementation:** Use `@Throttle({ default: { ttl: 900000, limit: 5 } })` decorator

### 6. Service Layer Responsibility
**Decision:** Implement password change logic in AuthService rather than UserService

**Rationale:**
- Password changes are authentication operations (verifying current password)
- AuthService already handles password hashing and verification for signin
- Keeps password-related logic centralized
- UserService can handle the actual database update via existing methods

### 7. Response Format
**Decision:** Return `{ data: { success: true } }` on successful password change

**Rationale:**
- Consistent with existing auth endpoints (verifyEmail, resendVerification)
- No sensitive data to return
- Simple boolean confirmation

## Risks / Trade-offs

**[Risk] JWT token remains valid after password change**
→ **Mitigation:** Acceptable for v1 - user changing password implies they have access. Future enhancement: invalidate all sessions on password change via token versioning/blacklist

**[Risk] Rate limiting per user or per IP?**
→ **Decision:** Per user (via JWT sub claim) - prevents legitimate users from being blocked by shared IP attacks. @nestjs/throttler supports both; we'll use default (IP-based) initially since authenticated endpoints are already somewhat protected.

**[Risk] Timing attacks on current password verification**
→ **Mitigation:** bcrypt.compare() is constant-time resistant. No additional mitigation needed.

**[Trade-off] No password confirmation field**
→ **Justification:** Frontend can handle confirmation UX. Backend only needs newPassword once for validation and storage.

## Migration Plan

**Deployment:**
1. Deploy backend changes (zero downtime - new endpoint doesn't affect existing functionality)
2. Update shared package with new types
3. Frontend can be deployed independently

**Rollback:**
- Safe - new endpoint and DTOs don't modify existing code paths
- Simply undeploy if issues arise

**Database:**
- No schema changes required
- Uses existing `password` field in `users` collection
