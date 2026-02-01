## Context

The backend email verification feature is complete, but the frontend currently has no UI to support the verification flow. Users who sign up are sent verification emails, but have no way to verify their email, resend verification emails, or understand why they cannot sign in when their email is unverified.

**Current State:**
- Signup flow creates user and backend sends verification email
- No verification page exists to handle the token from email links
- Signin returns 403 for unverified users with no user-friendly error handling
- No resend verification functionality
- API client doesn't have methods for verification endpoints

**Constraints:**
- Must use existing React Router setup
- Must use existing React Query patterns for API calls
- Must follow existing component structure in `packages/frontend/src/features/`
- Must use shared types from `@easy-auth/shared` package

## Goals / Non-Goals

**Goals:**
- Provide complete email verification UI matching backend API
- Clear, user-friendly messaging for all verification states
- Seamless integration with existing signup/signin flows
- Error handling that prevents user confusion
- Rate limiting awareness in UI

**Non-Goals:**
- Email template design (backend handles this)
- Password reset functionality (separate feature)
- Email preferences or notification settings
- OAuth verification flow

## Decisions

### Decision 1: Dedicated Verification Page vs Modal

**Choice:** Create dedicated `/verify-email` route page

**Rationale:**
- Users arrive via email link (external navigation) - full page is more appropriate than modal
- Allows for bookmarkable verification URLs
- Simpler state management than modal
- Consistent with typical email verification UX patterns

**Alternatives considered:**
- Modal overlay: Would require complex routing to show modal from email link
- Inline verification in signin page: Confusing UX, mixes two separate flows

### Decision 2: Resend Verification Location

**Choice:** Add resend functionality in two places:
1. Verification error state (on verification page)
2. Signin 403 error (on signin page)

**Rationale:**
- Users may not receive email (spam, delivery issues) - need path from signup
- Users may return later and forget - need path from signin
- Covers both "never received" and "returning user" scenarios

**Alternatives considered:**
- Only on verification page: Doesn't help users who try to sign in
- Separate "/resend-verification" page: Extra navigation friction
- Email link in signup success: Already done by backend

### Decision 3: API Client Structure

**Choice:** Add `verifyEmail` and `resendVerification` methods to existing auth API module

**Rationale:**
- Verification is part of authentication flow
- Keeps related functionality together
- Follows existing pattern in `packages/frontend/src/features/auth/api/`
- Uses same React Query patterns

### Decision 4: Post-Signup Messaging

**Choice:** Show inline success message on signup page after form submission

**Rationale:**
- Users need immediate feedback about next steps
- Prevents confusion about why they can't sign in immediately
- Less disruptive than full-page redirect
- Maintains context (still on signup page)

**Alternatives considered:**
- Redirect to separate "check your email" page: Extra navigation
- Toast notification only: Easily missed

### Decision 5: Rate Limit Feedback

**Choice:** Disable resend button temporarily after successful resend, show error toast on rate limit

**Rationale:**
- Prevents accidental spam clicking
- API returns 429 after 3 requests/5min - UI should reflect this
- Clear feedback without blocking user from other actions

## Risks / Trade-offs

### Risk: Token in URL
**Risk:** Verification token visible in browser history and logs  
**Mitigation:** Tokens expire in 15 minutes (backend enforced), single-use tokens deleted after verification

### Risk: Email delivery issues
**Risk:** Users may not receive verification emails (spam filters)  
**Mitigation:** 
- Clear messaging to check spam folder in post-signup message
- Easy resend functionality available
- Silent API responses prevent email enumeration attacks

### Risk: Expired token UX
**Risk:** Users may click old verification links after 15-minute expiry  
**Mitigation:** 
- Clear error message explaining expiration
- Immediate option to resend without extra navigation

### Trade-off: Fire-and-forget email sending
**Trade-off:** User sees success before email actually sends (backend returns success immediately)  
**Rationale:** Prevents email enumeration attacks, backend handles delivery asynchronously

## Migration Plan

1. **Add API methods** - No breaking changes, additive only
2. **Add verification page** - New route, no conflicts
3. **Update signup page** - Add success message after existing flow
4. **Update signin page** - Add 403 error handling
5. **Test flow** - Complete signup → verify → signin cycle
6. **Deploy** - Frontend changes are backward compatible

**Rollback:** Simply redeploy previous frontend version. Backend verification is optional (users just can't sign in until verified).

## Open Questions

None - design is straightforward given clear backend API contract.
