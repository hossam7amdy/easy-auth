## ADDED Requirements

### Requirement: Change password page
The system SHALL provide a protected `/change-password` route that displays a change password form for authenticated users.

#### Scenario: Authenticated user accesses page
- **WHEN** an authenticated user navigates to `/change-password`
- **THEN** the system SHALL display the change password form

#### Scenario: Unauthenticated user accesses page
- **WHEN** an unauthenticated user attempts to access `/change-password`
- **THEN** the system SHALL redirect to the signin page

---

### Requirement: Change password form fields
The change password form SHALL include current password and new password input fields.

#### Scenario: Form displays required fields
- **WHEN** the change password page loads
- **THEN** the form SHALL display a current password field
- **THEN** the form SHALL display a new password field
- **THEN** both fields SHALL be password input type (masked)
- **THEN** the form SHALL display a submit button

#### Scenario: Form fields are required
- **WHEN** user attempts to submit with empty current password field
- **THEN** the system SHALL display a validation error "Current password is required"

- **WHEN** user attempts to submit with empty new password field
- **THEN** the system SHALL display a validation error "Password is required"

---

### Requirement: Client-side password validation
The new password field SHALL validate input against password strength requirements before submission.

#### Scenario: Password too short
- **WHEN** user enters a new password with fewer than 8 characters
- **THEN** the system SHALL display an error "Password must be at least 8 characters long"

#### Scenario: Password missing letter
- **WHEN** user enters a new password without any letters
- **THEN** the system SHALL display an error "Password must contain at least one letter"

#### Scenario: Password missing number
- **WHEN** user enters a new password without any numbers
- **THEN** the system SHALL display an error "Password must contain at least one number"

#### Scenario: Password missing special character
- **WHEN** user enters a new password without any special characters (!@#$%^&*(),.?":{}|<>)
- **THEN** the system SHALL display an error "Password must contain at least one special character"

#### Scenario: Valid password format
- **WHEN** user enters a new password that meets all requirements (min 8 chars, has letter, number, and special char)
- **THEN** the system SHALL NOT display validation errors for the new password field

---

### Requirement: Password change submission
The form SHALL submit current and new passwords to the backend API when valid.

#### Scenario: Successful password change
- **WHEN** user submits valid current password and new password
- **THEN** the system SHALL send PUT request to `/v1/auth/change-password` with `currentPassword` and `newPassword`
- **THEN** the system SHALL include JWT token in Authorization header
- **THEN** upon successful response, the system SHALL display a success message
- **THEN** the system SHALL redirect to dashboard after 2 seconds

#### Scenario: Incorrect current password
- **WHEN** user submits incorrect current password
- **THEN** the backend SHALL return 400 error
- **THEN** the system SHALL display error message "Current password is incorrect" on the current password field
- **THEN** the system SHALL NOT redirect

#### Scenario: New password validation fails on backend
- **WHEN** the backend returns 400 validation error for new password
- **THEN** the system SHALL display the backend validation error messages
- **THEN** the system SHALL NOT redirect

#### Scenario: Session expired during submission
- **WHEN** user submits form but JWT token is invalid or expired
- **THEN** the backend SHALL return 401 error
- **THEN** the system SHALL redirect to signin page

#### Scenario: Rate limit exceeded
- **WHEN** user exceeds 5 password change attempts in 15 minutes
- **THEN** the backend SHALL return 429 error
- **THEN** the system SHALL display message "Too many password change attempts. Please try again in 15 minutes."

#### Scenario: Network error during submission
- **WHEN** network request fails due to connectivity issues
- **THEN** the system SHALL display error message "Network error. Please check your connection and try again."

---

### Requirement: Form state during submission
The form SHALL provide visual feedback during password change submission.

#### Scenario: Disable form during submission
- **WHEN** password change request is in progress
- **THEN** the system SHALL disable the submit button
- **THEN** the system SHALL display loading indicator on the submit button
- **THEN** the system SHALL keep form fields enabled for accessibility

#### Scenario: Re-enable form after completion
- **WHEN** password change request completes (success or error)
- **THEN** the system SHALL re-enable the submit button
- **THEN** the system SHALL remove loading indicator

---

### Requirement: Navigation to change password
The dashboard SHALL provide a way to navigate to the change password page.

#### Scenario: Dashboard shows change password button
- **WHEN** user views the dashboard
- **THEN** the dashboard SHALL display a "Change Password" button or link

#### Scenario: Navigate to change password from dashboard
- **WHEN** user clicks the "Change Password" button
- **THEN** the system SHALL navigate to `/change-password` route

---

### Requirement: Success feedback
The system SHALL provide clear feedback when password change succeeds.

#### Scenario: Display success message
- **WHEN** password change completes successfully
- **THEN** the system SHALL display a success message "Password changed successfully"
- **THEN** the success message SHALL be clearly visible to the user

#### Scenario: Auto-redirect after success
- **WHEN** success message is displayed
- **THEN** the system SHALL redirect to dashboard after 2 seconds
- **THEN** the system SHALL provide visual countdown or indication of pending redirect
