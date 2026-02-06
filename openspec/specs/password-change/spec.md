# password-change Specification

## Purpose
TBD - created by archiving change add-change-password. Update Purpose after archive.
## Requirements
### Requirement: Password change endpoint
The system SHALL provide an authenticated endpoint `PUT /v1/auth/change-password` that allows users to update their password.

#### Scenario: Successful password change
- **WHEN** an authenticated user submits valid current password and a new password that meets validation requirements
- **THEN** the system SHALL verify the current password matches the user's stored password
- **THEN** the system SHALL hash and store the new password
- **THEN** the system SHALL return `{ success: true }`

#### Scenario: Unauthenticated request
- **WHEN** an unauthenticated user (no JWT) attempts to change password
- **THEN** the system SHALL return a 401 Unauthorized error

#### Scenario: Invalid current password
- **WHEN** the provided current password does not match the user's stored password
- **THEN** the system SHALL return a 400 Bad Request error with message indicating incorrect current password
- **THEN** the system SHALL NOT update the password

#### Scenario: New password fails validation
- **WHEN** the new password does not meet strength requirements
- **THEN** the system SHALL return a 400 Bad Request error with validation details
- **THEN** the system SHALL NOT update the password

#### Scenario: Same password as current
- **WHEN** the new password is identical to the current password
- **THEN** the system SHALL return a 400 Bad Request error indicating the new password must be different
- **THEN** the system SHALL NOT update the password

---

### Requirement: Password validation
Password validation for the change password endpoint SHALL use the same validation rules as the signup endpoint.

#### Scenario: Minimum length requirement
- **WHEN** a new password is less than the minimum required length
- **THEN** the system SHALL reject it with a validation error

#### Scenario: Maximum length requirement
- **WHEN** a new password exceeds the maximum allowed length
- **THEN** the system SHALL reject it with a validation error

#### Scenario: Valid password format
- **WHEN** a new password meets all validation requirements (length, complexity, etc.)
- **THEN** the system SHALL accept it for password change

---

### Requirement: Rate limiting for password change
The password change endpoint SHALL be rate-limited to prevent brute force attacks on current password verification.

#### Scenario: Within rate limit
- **WHEN** a user makes 5 or fewer password change requests within 15 minutes
- **THEN** the system SHALL process the requests normally

#### Scenario: Exceeding rate limit
- **WHEN** a user exceeds 5 password change requests within 15 minutes
- **THEN** the system SHALL return 429 Too Many Requests

---

### Requirement: Request and response format
The password change endpoint SHALL accept and return specific data structures.

#### Scenario: Valid request format
- **WHEN** a password change request is submitted
- **THEN** the request body MUST include `currentPassword` (string) and `newPassword` (string) fields
- **THEN** both fields MUST be required and non-empty

#### Scenario: Successful response format
- **WHEN** a password change succeeds
- **THEN** the response SHALL follow the standard `ApiResponse` format with `{ data: { success: true } }`

#### Scenario: Missing required fields
- **WHEN** the request is missing `currentPassword` or `newPassword`
- **THEN** the system SHALL return a 400 Bad Request error with validation details

---

### Requirement: Password hashing
The new password SHALL be hashed using the same secure hashing algorithm as used in signup before storage.

#### Scenario: Password stored securely
- **WHEN** a password change succeeds
- **THEN** the new password SHALL be hashed (not stored in plaintext)
- **THEN** the hashed password SHALL replace the old hashed password in the database

#### Scenario: Current password verification
- **WHEN** verifying the current password
- **THEN** the system SHALL compare against the stored hashed password
- **THEN** the system SHALL NOT expose password hashes in any response

