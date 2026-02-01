## 1. API Client Updates

- [x] 1.1 Add `verifyEmail` and `resendVerification` types to API client (import from @easy-auth/shared)
- [x] 1.2 Implement `verifyEmail(token: string)` method in auth API module
- [x] 1.3 Implement `resendVerification(email: string)` method in auth API module
- [x] 1.4 Create React Query hooks: `useVerifyEmail` and `useResendVerification`

## 2. Email Verification Page

- [x] 2.1 Create `/verify-email` route in routing configuration
- [x] 2.2 Create `VerifyEmailPage` component in features/auth
- [x] 2.3 Extract token from URL query parameters
- [x] 2.4 Call verification API on page load with extracted token
- [x] 2.5 Display success state with link to signin page
- [x] 2.6 Display error state for invalid/expired tokens
- [x] 2.7 Add "Resend verification email" option on error state
- [x] 2.8 Handle missing token parameter case

## 3. Signup Flow Updates

- [x] 3.1 Update signup success handler to show verification message
- [x] 3.2 Display "Please check your email to verify your account" message after successful signup
- [x] 3.3 Include instruction to check spam folder in success message
- [x] 3.4 Style success message component (consistent with existing design system)

## 4. Signin Flow Updates

- [x] 4.1 Add error handler for 403 status responses in signin mutation
- [x] 4.2 Display "Please verify your email address before signing in" error message for 403
- [x] 4.3 Create ResendVerificationForm component (email input + submit button)
- [x] 4.4 Show ResendVerificationForm below signin error when 403 occurs
- [x] 4.5 Handle resend submission and show success toast
- [x] 4.6 Disable resend button temporarily after successful send
- [x] 4.7 Handle rate limit errors (429) with appropriate messaging

## 5. Error Handling & UX

- [x] 5.1 Add error handling for network failures in verification flow
- [x] 5.2 Add loading states for verification API calls
- [x] 5.3 Add toast notifications for success/error feedback on resend
- [x] 5.4 Ensure all error messages are user-friendly and actionable

## 6. Testing

- [x] 6.1 Test complete flow: signup → check email → verify → signin
- [x] 6.2 Test resend verification from signin page (403 error)
- [x] 6.3 Test resend verification from verify page (error state)
- [x] 6.4 Test expired token handling
- [x] 6.5 Test invalid token handling
- [x] 6.6 Test rate limiting behavior (3 resends in 5 minutes)
- [x] 6.7 Test missing token parameter case
