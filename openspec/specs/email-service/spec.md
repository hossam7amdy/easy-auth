# email-service Specification

## Purpose
TBD - created by archiving change email-verification. Update Purpose after archive.
## Requirements
### Requirement: Nodemailer-based email service
The system SHALL provide an email service using nodemailer with configuration passed directly from environment variables.

#### Scenario: Email service initialization
- **WHEN** the email service is initialized
- **THEN** it SHALL create a nodemailer transporter using SMTP configuration from environment
- **THEN** it SHALL accept any valid nodemailer SMTP configuration

#### Scenario: Sending email
- **WHEN** an email is sent via the service
- **THEN** it SHALL accept recipient, subject, and body (HTML and/or plain text)
- **THEN** it SHALL return success or throw an error on failure

---

### Requirement: SMTP configuration via environment
The system SHALL read SMTP configuration from environment variables and pass directly to nodemailer.

#### Scenario: Mailpit local development
- **WHEN** SMTP_HOST is set to "localhost" and SMTP_PORT to "1025"
- **THEN** the system SHALL connect to Mailpit without authentication
- **THEN** emails SHALL be captured and viewable in the Mailpit web UI at port 8025

#### Scenario: Resend production via SMTP
- **WHEN** SMTP_HOST is set to "smtp.resend.com"
- **THEN** the system SHALL connect using SMTP_USER and SMTP_PASS for authentication
- **THEN** emails SHALL be delivered via Resend's SMTP relay

#### Scenario: Configuration structure
- **WHEN** the email service reads configuration
- **THEN** it SHALL support: SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
- **THEN** authentication SHALL only be included when SMTP_USER is present

---

### Requirement: Verification email template
The system SHALL provide a verification email template with the verification link.

#### Scenario: Email content
- **WHEN** a verification email is sent
- **THEN** it SHALL include the user's name in the greeting
- **THEN** it SHALL include a clickable verification link
- **THEN** it SHALL indicate the link expires in 15 minutes
- **THEN** it SHALL include both HTML and plain text versions

#### Scenario: Verification link format
- **WHEN** the verification link is generated
- **THEN** it SHALL be in the format `{FRONTEND_URL}/verify-email?token={token}`
- **THEN** the frontend page SHALL extract the token and POST it to `/api/v1/verify-email`

---

### Requirement: Docker Compose Mailpit service
The local development environment SHALL include a Mailpit service for email testing.

#### Scenario: Mailpit availability
- **WHEN** Docker Compose is started
- **THEN** Mailpit SHALL be available on port 8025 (web UI) and 1025 (SMTP)

#### Scenario: Email capture
- **WHEN** emails are sent via SMTP to localhost:1025
- **THEN** they SHALL be captured and viewable in the Mailpit web interface

