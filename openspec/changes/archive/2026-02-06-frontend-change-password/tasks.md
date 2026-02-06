## 1. API Integration

- [x] 1.1 Create custom hook `/hooks/api/use-change-password.ts` using existing API patterns
- [x] 1.2 Define TypeScript types for request/response (use `ChangePasswordRequest`, `ChangePasswordResponse` from `@easy-auth/shared`)
- [x] 1.3 Implement mutation hook with proper error handling and auth header

## 2. Change Password Route Component

- [x] 2.1 Create route directory `/routes/change-password/`
- [x] 2.2 Create route component `/routes/change-password/change-password.tsx`
- [x] 2.3 Create route index file `/routes/change-password/index.tsx` with lazy export
- [x] 2.4 Implement protected route structure matching existing patterns

## 3. Form Component Implementation

- [x] 3.1 Create form with current password field (password input type)
- [x] 3.2 Create form with new password field (password input type)
- [x] 3.3 Add submit button with loading state indicator
- [x] 3.4 Integrate with `useChangePassword` custom hook
- [x] 3.5 Implement form state management (controlled inputs)

## 4. Client-Side Validation

- [x] 4.1 Add required field validation for current password ("Current password is required")
- [x] 4.2 Add required field validation for new password ("Password is required")
- [x] 4.3 Add min length validation for new password (8 chars - "Password must be at least 8 characters long")
- [x] 4.4 Add letter requirement validation ("Password must contain at least one letter")
- [x] 4.5 Add number requirement validation ("Password must contain at least one number")
- [x] 4.6 Add special character validation ("Password must contain at least one special character")
- [x] 4.7 Display validation errors inline on form fields

## 5. Error Handling

- [x] 5.1 Handle 400 incorrect current password error - display on current password field
- [x] 5.2 Handle 400 validation errors from backend - display relevant field errors
- [x] 5.3 Handle 401 unauthorized error - redirect to signin
- [x] 5.4 Handle 429 rate limit error - display "Too many password change attempts. Please try again in 15 minutes."
- [x] 5.5 Handle network errors - display "Network error. Please check your connection and try again."

## 6. Success Flow

- [x] 6.1 Display success message "Password changed successfully" on successful submission
- [x] 6.2 Implement auto-redirect to dashboard after 2 seconds
- [x] 6.3 Add visual countdown or indication of pending redirect

## 7. Loading States

- [x] 7.1 Disable submit button during API request
- [x] 7.2 Show loading indicator on submit button during request
- [x] 7.3 Re-enable button after request completes (success or error)

## 8. Router Configuration

- [x] 8.1 Add `/change-password` route to `App.tsx` under `ProtectedRoute` wrapper
- [x] 8.2 Verify route lazy-loads the change-password component
- [x] 8.3 Test protected route redirects unauthenticated users to signin

## 9. Dashboard Integration

- [x] 9.1 Add "Change Password" button to dashboard card footer
- [x] 9.2 Wire button to navigate to `/change-password` on click
- [x] 9.3 Position button appropriately with existing dashboard buttons

## 10. UI Polish

- [x] 10.1 Match card-based UI design from existing routes (signin, signup)
- [x] 10.2 Ensure responsive design works on mobile screens
- [x] 10.3 Add appropriate spacing and styling to form fields
- [x] 10.4 Verify password fields show masked input
- [x] 10.5 Add clear labels for both password fields

## 11. Testing & Verification

- [x] 11.1 Manual test: Submit with valid passwords and verify success flow
- [x] 11.2 Manual test: Submit with incorrect current password and verify error
- [x] 11.3 Manual test: Submit with weak new password and verify client validation
- [x] 11.4 Manual test: Verify unauthenticated access redirects to signin
- [x] 11.5 Manual test: Test navigation from dashboard to change password page
- [x] 11.6 Manual test: Verify form disables during submission
- [x] 11.7 Manual test: Verify success message and auto-redirect after 2 seconds
