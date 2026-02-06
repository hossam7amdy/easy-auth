## 1. Shared Package Updates

- [x] 1.1 Add `ChangePasswordRequest` and `ChangePasswordResponse` types to `packages/shared/src/api.ts`
- [x] 1.2 Add `changePassword` endpoint config to `packages/shared/src/endpoints.ts` with path `/v1/auth/change-password`, method `put`, and `auth: true`

## 2. Backend - Password Validation Decorator

- [x] 2.1 Create `packages/backend/src/common/decorators/password.decorator.ts` with reusable password validation decorators
- [x] 2.2 Extract password validation from `packages/backend/src/modules/auth/dto/signup.dto.ts` to use the new decorator
- [x] 2.3 Verify signup tests still pass after refactoring

## 3. Backend - DTOs

- [x] 3.1 Create `packages/backend/src/modules/auth/dto/change-password.dto.ts` with `ChangePasswordRequestDto` (currentPassword, newPassword fields)
- [x] 3.2 Create `ChangePasswordResponseDto` in the same file following existing response DTO patterns
- [x] 3.3 Apply password validation decorator to `newPassword` field
- [x] 3.4 Add custom validation to ensure newPassword is different from currentPassword

## 4. Backend - Service Layer

- [x] 4.1 Add `changePassword(userId: string, changePasswordDto: ChangePasswordRequest)` method to `packages/backend/src/modules/auth/services/auth.service.ts`
- [x] 4.2 Implement current password verification using `bcrypt.compare()`
- [x] 4.3 Implement new password hashing using `bcrypt.hash()` with existing SALT_ROUNDS
- [x] 4.4 Update user password via `userRepository.update()`
- [x] 4.5 Return `{ success: true }` on success, throw appropriate exceptions on failures

## 5. Backend - Controller

- [x] 5.1 Add `changePassword` endpoint to `packages/backend/src/modules/auth/controllers/auth.controller.ts`
- [x] 5.2 Apply `@Put()` decorator with endpoint path from `ENDPOINT_CONFIGS.changePassword.path`
- [x] 5.3 Apply `@UseGuards(JwtAuthGuard)` to require authentication
- [x] 5.4 Apply `@Throttle({ default: { ttl: 900000, limit: 5 } })` for rate limiting (5 requests per 15 minutes)
- [x] 5.5 Add Swagger decorators (`@ApiOperation`, `@ApiOkResponse`, `@ApiBadRequestResponse`, `@ApiUnauthorizedResponse`)
- [x] 5.6 Extract userId from JWT request and call `authService.changePassword()`

## 6. Backend - Unit Tests

- [x] 6.1 Add unit tests for `AuthService.changePassword()` in `packages/backend/src/modules/auth/services/auth.service.spec.ts`
- [x] 6.2 Test successful password change scenario
- [x] 6.3 Test invalid current password scenario (should throw UnauthorizedException or BadRequestException)
- [x] 6.4 Test new password same as current password scenario
- [x] 6.5 Test new password validation failures
- [x] 6.6 Add unit tests for `AuthController.changePassword()` in `packages/backend/src/modules/auth/controllers/auth.controller.spec.ts`
- [x] 6.7 Test controller properly calls service with correct parameters

## 7. Backend - E2E Tests

- [x] 7.1 Add e2e test file or update existing auth e2e tests for change password endpoint
- [x] 7.2 Test successful password change with valid JWT and correct current password
- [x] 7.3 Test unauthenticated request returns 401
- [x] 7.4 Test incorrect current password returns 400
- [x] 7.5 Test new password validation failures return 400
- [x] 7.6 Test same password as current returns 400
- [x] 7.7 Test rate limiting (exceed 5 requests in 15 minutes returns 429)
- [x] 7.8 Test that user can sign in with new password after successful change

## 8. Verification

- [x] 8.1 Run all backend unit tests: `pnpm --filter @easy-auth/backend test`
- [x] 8.2 Run all backend e2e tests: `pnpm --filter @easy-auth/backend test:e2e`
- [x] 8.3 Verify no linting errors: `pnpm lint`
- [x] 8.4 Manual testing: Start dev server and test the endpoint with Postman/curl
