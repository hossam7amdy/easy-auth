## Context

The backend provides a `PUT /v1/auth/change-password` endpoint that requires JWT authentication and accepts `currentPassword` and `newPassword`. Password validation rules (min 8 chars, letter, number, special char) are enforced on the backend with the `IsPassword` decorator. The frontend follows a vertical slice architecture with routes in `/src/routes/<feature>/`, API hooks in `/src/hooks/api/`, and shared components in `/src/components/`.

Current routing uses React Router with lazy-loaded routes, `ProtectedRoute` wrapper for authenticated pages, and card-based UI components from shadcn/ui. The dashboard currently shows user profile with sign-out functionality.

## Goals / Non-Goals

**Goals:**
- Provide a secure, user-friendly interface for authenticated users to change their password
- Match frontend validation to backend requirements before submission
- Handle all error states gracefully (validation, incorrect password, rate limiting, network errors)
- Follow existing frontend patterns for consistency (route structure, API hooks, form components)
- Add navigation from dashboard to change password page

**Non-Goals:**
- Password reset for forgotten passwords (different flow, requires email verification)
- Password strength meter or complexity suggestions (future enhancement)
- Password history or reuse prevention (backend concern)
- Multi-factor authentication changes

## Decisions

### Decision 1: Route Structure
**Choice:** Create `/change-password` as a protected route (requires authentication)

**Rationale:** 
- Changing password requires knowing the current password, so authentication is required
- Follows existing pattern of protected routes under `ProtectedRoute` wrapper
- Path `/change-password` is clear and RESTful

**Alternatives Considered:**
- Nested under `/profile/change-password` - rejected because we don't have a dedicated profile page yet, and this keeps routing flat and simple

---

### Decision 2: Component Architecture
**Structure:**
- Route component: `/routes/change-password/change-password.tsx`
- Route index: `/routes/change-password/index.tsx`
- Custom hook: `/hooks/api/use-change-password.ts` (or add to existing auth hooks file)  
- Form validation: Inline using existing patterns (leverage shared validation if available)

**Rationale:**
- Matches existing route structure (e.g., `/routes/signin/signin.tsx`)
- Encapsulates API logic in custom hook following existing pattern (`useSignOut`, `useGetCurrentUser`)
- Keeps components focused and testable

**Alternatives Considered:**
- Separate form component - rejected as overkill for a simple 2-field form
- Shared validation utilities - good future refactor, but inline validation is acceptable for MVP

---

### Decision 3: Form Validation Strategy
**Choice:** Client-side validation matching backend rules + backend error display

**Validation:**
- Current password: Required, non-empty
- New password: Required, min 8 chars, must contain letter + number + special char
- Display validation errors inline on blur/submit
- Also display backend validation errors if they occur

**Rationale:**
- Prevents unnecessary API calls for invalid input
- Provides immediate feedback to users
- Backend remains source of truth (client validation is UX enhancement only)

**Alternatives Considered:**
- Backend-only validation - rejected, poor UX with network round-trip for basic errors
- Shared validation library between frontend/backend - ideal but out of scope for this change

---

### Decision 4: Success Flow
**Choice:** On successful password change, show success message and redirect to dashboard after 2 seconds

**Rationale:**
- Users need confirmation that action succeeded
- Brief delay allows reading success message
- Redirect to dashboard provides clear next action

**Alternatives Considered:**
- Stay on change password page with success message - rejected, no reason to stay on page after success
- Immediate redirect - rejected, users might miss success confirmation
- Force re-login with new password - rejected, overly disruptive UX

---

### Decision 5: Error Handling
**Handle these error states:**
- **400 Validation Error**: Display field-specific errors (weak password, missing fields)
- **400 Incorrect Password**: Display error on current password field
- **401 Unauthorized**: Redirect to signin (session expired)
- **429 Rate Limited**: Display message "Too many attempts, try again in 15 minutes"
- **Network Error**: Display generic error with retry option

**Rationale:**
- Covers all backend error responses
- Provides actionable feedback to users
- Graceful degradation for network issues

---

### Decision 6: Dashboard Integration
**Choice:** Add "Change Password" button in dashboard card footer alongside existing buttons

**Rationale:**
- Dashboard is currently the only authenticated page
- Keeps all account actions in one place
- Simple addition without major UI restructure

**Alternatives Considered:**
- Dedicated settings page - rejected, premature for single action
- Profile page - rejected, doesn't exist yet
- Dropdown menu - rejected, overkill for single link

## Risks / Trade-offs

**[Risk]** Client-side password validation could drift from backend validation → **Mitigation:** Document validation rules in spec, consider extracting to shared library in future

**[Risk]** Rate limiting (5 requests per 15 min) could frustrate users making typos → **Mitigation:** Clear error message with time remaining, and client validation reduces need for multiple attempts

**[Risk]** No confirmation for current password field increases chance of typos → **Mitigation:** Accept as trade-off for simpler UX, backend verification catches incorrect password

**[Trade-off]** Inline validation vs shared validation library: Chose inline for speed, but creates duplication with backend. Future refactor should extract to shared package.

**[Trade-off]** Auto-redirect after success: Some users might want to stay and change password again or read details, but we optimize for the common case of one-time password change.
