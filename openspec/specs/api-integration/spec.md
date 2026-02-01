# api-integration Specification

## Purpose
TBD - created by archiving change frontend-email-verification. Update Purpose after archive.
## Requirements
### Requirement: Verify email API method
The API client SHALL provide a method to verify a user's email address using a verification token.

#### Scenario: Call verify email endpoint
- **WHEN** `verifyEmail(token: string)` method is called
- **THEN** system sends POST request to `/api/v1/verify-email`
- **AND** request body contains `{ token: <token> }`
- **AND** returns promise resolving to `{ success: boolean }`

#### Scenario: Handle verify email success
- **WHEN** API returns 200 status
- **THEN** method resolves with `{ data: { success: true } }`

#### Scenario: Handle verify email error
- **WHEN** API returns 400 status with invalid token
- **THEN** method rejects with error containing response message

### Requirement: Resend verification email API method
The API client SHALL provide a method to request resending of verification email with rate limiting support.

#### Scenario: Call resend verification endpoint
- **WHEN** `resendVerification(email: string)` method is called
- **THEN** system sends POST request to `/api/v1/resend-verification`
- **AND** request body contains `{ email: <email> }`
- **AND** returns promise resolving to `{ success: boolean }`

#### Scenario: Handle resend success
- **WHEN** API returns 200 status
- **THEN** method resolves with `{ data: { success: true } }`

#### Scenario: Handle rate limit error
- **WHEN** API returns 429 status (rate limited)
- **THEN** method rejects with error containing throttle information

### Requirement: Type safety for verification endpoints
The API client SHALL use TypeScript types from shared package for verification request/response types.

#### Scenario: Import shared types
- **WHEN** verification methods are implemented
- **THEN** request DTOs are typed using `VerifyEmailRequest` and `ResendVerificationRequest` from `@easy-auth/shared`
- **AND** response DTOs are typed using `VerifyEmailResponse` and `ResendVerificationResponse` from `@easy-auth/shared`

