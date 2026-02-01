## ADDED Requirements

### Requirement: User verification status
The system SHALL track whether a user's email address has been verified via an `isEmailVerified` boolean field that defaults to `false`.

#### Scenario: New user has unverified status
- **WHEN** a new user is created
- **THEN** the user's `isEmailVerified` field SHALL be `false`

#### Scenario: Verified user status persists
- **WHEN** a user's email has been verified
- **THEN** the user's `isEmailVerified` field SHALL be `true`

---

### Requirement: Verification token generation
The system SHALL generate a unique verification token when a user signs up. The token SHALL be a UUID v4 format string, stored in a separate VerificationToken collection with the user reference and expiration timestamp.

#### Scenario: Token generated on signup
- **WHEN** a user completes signup
- **THEN** the system SHALL generate a UUID v4 verification token
- **THEN** the token SHALL be stored with the user's ID and an expiration time of 15 minutes

#### Scenario: Token is unique
- **WHEN** multiple tokens are generated
- **THEN** each token SHALL be globally unique

---

### Requirement: Verification token expiration
Verification tokens SHALL expire after 15 minutes from creation.

#### Scenario: Token within expiration window
- **WHEN** a verification request is made within 15 minutes of token creation
- **THEN** the token SHALL be considered valid

#### Scenario: Token past expiration window
- **WHEN** a verification request is made after 15 minutes from token creation
- **THEN** the system SHALL reject the token with an error indicating it has expired

---

### Requirement: Email verification endpoint
The system SHALL provide an endpoint to verify a user's email address using a token.

#### Scenario: Successful verification
- **WHEN** a valid, non-expired token is submitted to `POST /api/v1/verify-email` with `{ token: "xxx" }` in the request body
- **THEN** the system SHALL set the user's `isEmailVerified` to `true`
- **THEN** the system SHALL delete the used token
- **THEN** the system SHALL return `{ success: true }` (no JWT auto-login)

#### Scenario: Invalid token
- **WHEN** a non-existent token is submitted
- **THEN** the system SHALL return a 400 Bad Request error

#### Scenario: Expired token
- **WHEN** an expired token is submitted
- **THEN** the system SHALL return a 400 Bad Request error indicating the token has expired
- **THEN** the system SHALL delete the expired token

#### Scenario: Already verified user
- **WHEN** a token is submitted for an already verified user
- **THEN** the system SHALL return a success response (idempotent)

---

### Requirement: Unverified users blocked from sign-in
The system SHALL prevent unverified users from signing in.

#### Scenario: Unverified user attempts sign-in
- **WHEN** an unverified user attempts to sign in with valid credentials
- **THEN** the system SHALL return a 403 Forbidden error with message "Email not verified"

#### Scenario: Verified user signs in
- **WHEN** a verified user attempts to sign in with valid credentials
- **THEN** the system SHALL proceed with normal authentication and return a JWT

---

### Requirement: Resend verification email
The system SHALL provide an endpoint to resend verification emails for unverified users.

#### Scenario: Successful resend
- **WHEN** an unverified user requests a new verification email via `POST /api/v1/resend-verification`
- **THEN** the system SHALL delete any existing tokens for that user
- **THEN** the system SHALL generate a new verification token
- **THEN** the system SHALL send a new verification email
- **THEN** the system SHALL return `{ success: true }`

#### Scenario: Already verified user requests resend
- **WHEN** a verified user requests a resend
- **THEN** the system SHALL return 200 OK (silent no-op to prevent email enumeration)

#### Scenario: Non-existent email requests resend
- **WHEN** a non-existent email requests a resend
- **THEN** the system SHALL return 200 OK (silent no-op to prevent email enumeration)

---

### Requirement: Resend rate limiting
The resend verification endpoint SHALL be rate-limited to prevent abuse.

#### Scenario: Within rate limit
- **WHEN** a user makes 3 or fewer resend requests within 5 minutes
- **THEN** the system SHALL process the requests normally

#### Scenario: Exceeding rate limit
- **WHEN** a user exceeds 3 resend requests within 5 minutes
- **THEN** the system SHALL return 429 Too Many Requests

---

### Requirement: Signup triggers verification email
The signup flow SHALL automatically send a verification email upon successful user creation.

#### Scenario: Successful signup sends email
- **WHEN** a user successfully signs up
- **THEN** the system SHALL generate a verification token
- **THEN** the system SHALL send a verification email with a link containing the token
- **THEN** the signup response SHALL include a message indicating the user should check their email

#### Scenario: Email sending failure does not block signup
- **WHEN** the email service fails to send the verification email
- **THEN** the user account SHALL still be created
- **THEN** the user can use the resend endpoint to request a new verification email
