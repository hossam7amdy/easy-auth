## Why

The backend now supports email verification, but the frontend lacks UI flows to complete the verification process. Users cannot verify their emails, resend verification emails, or handle verification errors, making the feature incomplete.

## What Changes

- Add email verification page at `/verify-email` route to handle token-based verification
- Display post-signup message prompting users to check email
- Add "Resend verification email" functionality on signin page for unverified users
- Add appropriate error handling and user feedback for verification states
- Update API client to support new verification endpoints

## Capabilities

### New Capabilities
- `email-verification-ui`: Complete UI flow for email verification including verification page, resend functionality, success/error states, and post-signup messaging
- `api-integration`: API client methods for `/api/v1/verify-email` and `/api/v1/resend-verification` endpoints

### Modified Capabilities
<!-- No existing capabilities being modified -->

## Impact

**Affected Code:**
- New page component: `/verify-email` route
- Modified components: Signup page (success message), Signin page (403 error handling + resend option)
- API client: New methods for verification endpoints
- Routing: New route configuration

**Dependencies:**
- React Router (already in use)
- React Query (already in use)
- Existing API client structure

**User Experience:**
- Users will see verification prompt after signup
- Users will be blocked from signing in until verified
- Users can resend verification emails if not received
