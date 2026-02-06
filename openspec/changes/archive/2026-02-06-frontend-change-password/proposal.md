## Why

The backend password change functionality is complete and verified, but users currently have no way to change their password through the UI. This proposal adds a user-facing change password interface to complete the feature and provide essential account security functionality.

## What Changes

- Add a new protected `/change-password` route accessible only to authenticated users
- Create a change password form component with current password and new password fields
- Add client-side password validation matching backend requirements (min 8 chars, letter, number, special character)
- Integrate with the backend `PUT /v1/auth/change-password` API endpoint
- Implement error handling for incorrect current password, validation failures, and rate limiting
- Add success feedback and navigation after successful password change
- Add link/button in the user profile or settings to access the change password page

## Capabilities

### New Capabilities

- `password-change-ui`: Complete user interface for changing password, including protected route, form component, validation, API integration, error handling, and success feedback

### Modified Capabilities

None - this is a net-new frontend capability that integrates with the existing backend password-change API

## Impact

**Affected Code:**
- `packages/frontend/src/routes/` - New change password route component
- `packages/frontend/src/components/` - New change password form component  
- `packages/frontend/src/hooks/` - New custom hook for password change API call
- `packages/frontend/src/App.tsx` - Add new protected route to router configuration
- User profile/settings component - Add navigation link to change password

**APIs:**
- Consumes existing `PUT /v1/auth/change-password` backend endpoint
- Requires JWT authentication (user must be signed in)

**Dependencies:**
- Uses existing API client from `packages/shared`
- Follows existing form validation patterns
- Leverages existing auth context for JWT token

**User Experience:**
- Adds new functionality accessible from user profile/settings
- Provides secure password management capability
- Includes appropriate feedback for success/error states
