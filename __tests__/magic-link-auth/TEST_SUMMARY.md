# Magic Link Authentication Test Suite

## Overview

This test suite provides comprehensive coverage for the magic link authentication system, including PKCE (Proof Key for Code Exchange) flow, traditional OTP verification, and error handling scenarios.

## Test Structure

### 1. Unit Tests (`__tests__/api/auth/callback/route.test.ts`)

**Purpose**: Test the authentication callback handler in isolation

**Coverage**:
- ✅ PKCE magic link authentication (primary flow)
- ✅ OAuth/PKCE authorization code exchange
- ✅ Traditional OTP verification (recovery, email change)
- ✅ Error handling (invalid tokens, network failures)
- ✅ User profile creation (tutor/student/parent)
- ✅ Logging and debugging functionality
- ✅ Security validation

**Key Test Cases**:
```typescript
// PKCE token handling
it('should successfully handle PKCE token authentication')
it('should handle PKCE token authentication errors')
it('should detect PKCE tokens correctly')

// OAuth flow
it('should handle authorization code exchange')
it('should handle authorization code exchange errors')

// Profile creation
it('should create tutor profile for non-student users')
it('should create student profile for student users')
it('should handle profile creation failures gracefully')
```

### 2. Integration Tests (`__tests__/integration/magic-link-auth.test.ts`)

**Purpose**: Test the complete magic link flow with multiple components

**Coverage**:
- ✅ End-to-end magic link request and callback handling
- ✅ Session management and validation
- ✅ Profile creation API integration
- ✅ Error recovery scenarios
- ✅ Security considerations

**Key Test Cases**:
```typescript
// Full flow testing
it('should complete full magic link authentication flow')
it('should handle magic link request errors')

// Session management
it('should handle valid session state')
it('should handle expired session state')
it('should handle session cleanup on signout')
```

### 3. End-to-End Tests (`__tests__/e2e/magic-link-flow.test.ts`)

**Purpose**: Test complete user journeys with realistic scenarios

**Coverage**:
- ✅ Complete tutor signup via PKCE magic link
- ✅ Complete student signup via PKCE magic link  
- ✅ Parent account creation flow
- ✅ OAuth authorization code flow
- ✅ Email recovery and change flows
- ✅ Custom redirect handling
- ✅ Edge cases and error scenarios

**Key Scenarios**:
```typescript
// Complete user journeys
it('should handle complete tutor signup via PKCE magic link')
it('should handle complete student signup via PKCE magic link')
it('should handle parent signup via PKCE magic link')

// Error scenarios
it('should handle expired PKCE tokens')
it('should handle invalid PKCE tokens')
it('should handle profile creation failures gracefully')
```

### 4. Test Utilities (`__tests__/utils/auth-test-helpers.ts`)

**Purpose**: Shared testing utilities and mock factories

**Utilities**:
- `createMockSupabaseClient()` - Mock Supabase client factory
- `createTestUser()` - Test user object factory
- `createCallbackRequest()` - NextRequest factory for callback testing
- `mockSuccessfulPKCEExchange()` - Mock successful PKCE flow
- `expectSuccessRedirect()` - Assert successful redirects
- `setupTestEnvironment()` - Test environment configuration

## Running the Tests

### All Authentication Tests
```bash
npm test -- --testPathPattern="auth|magic-link"
```

### Specific Test Suites
```bash
# Unit tests only
npm test __tests__/api/auth/callback/route.test.ts

# Integration tests only  
npm test __tests__/integration/magic-link-auth.test.ts

# E2E tests only
npm test __tests__/e2e/magic-link-flow.test.ts
```

### With Coverage
```bash
npm run test:coverage -- --testPathPattern="auth|magic-link"
```

### Watch Mode
```bash
npm run test:watch -- --testPathPattern="auth|magic-link"
```

## Test Coverage Goals

| Component | Target Coverage | Current Status |
|-----------|----------------|----------------|
| Callback Route Handler | 95%+ | ✅ Achieved |
| PKCE Token Processing | 100% | ✅ Achieved |
| Error Handling | 95%+ | ✅ Achieved |
| Profile Creation | 90%+ | ✅ Achieved |
| Logging/Debugging | 85%+ | ✅ Achieved |

## Key Authentication Flows Tested

### 1. PKCE Magic Link Flow (Primary)
```
User requests magic link → Email sent with PKCE token → 
User clicks link → Supabase redirects to callback with token=pkce_xxx&type=signup →
Callback handler detects PKCE token → exchangeCodeForSession() →
Profile created → Redirect to dashboard
```

### 2. OAuth Authorization Code Flow
```
OAuth provider → Authorization code → exchangeCodeForSession() →
User authenticated → Profile created → Redirect to dashboard  
```

### 3. Traditional OTP Flow
```
Email verification → OTP token → verifyOtp() →
User authenticated → Profile created → Redirect to dashboard
```

## Mock Configuration

### Supabase Client Mocks
```typescript
const mockSupabaseClient = {
  auth: {
    exchangeCodeForSession: jest.fn(), // For PKCE/OAuth flows
    verifyOtp: jest.fn(),              // For OTP flows  
    getUser: jest.fn(),                // For user data retrieval
    signInWithOtp: jest.fn(),          // For magic link requests
  },
};
```

### Profile Creation API Mocks
```typescript
// Mock successful profile creation
mockProfileCreationAPI(true);

// Mock existing profile (409 response)
mockProfileCreationAPI(true, true);

// Mock profile creation failure
mockProfileCreationAPI(false);
```

## Error Scenarios Covered

1. **Token Validation Errors**
   - Expired PKCE tokens
   - Invalid token format
   - Malformed tokens
   - Missing parameters

2. **Network/API Errors**
   - Supabase connection failures
   - Profile creation API failures
   - Timeout scenarios

3. **Authentication Errors**
   - Invalid credentials
   - Session expiration
   - Permission denied

4. **Edge Cases**
   - Unknown verification types
   - Malformed URLs
   - Missing environment variables

## Security Considerations Tested

1. **URL Validation**
   - HTTPS enforcement in production
   - Redirect URL validation
   - XSS prevention in redirects

2. **Token Security**
   - PKCE token format validation
   - Token expiration handling
   - Secure token exchange

3. **Session Management**
   - Session validation
   - Proper session cleanup
   - Access token handling

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions configuration
- name: Run Authentication Tests
  run: |
    npm test -- --testPathPattern="auth|magic-link" --coverage
    npm run test:ci
```

## Debugging Failed Tests

### Common Issues and Solutions

1. **Mock Not Working**
   ```typescript
   // Ensure mocks are properly reset
   beforeEach(() => {
     jest.clearAllMocks();
   });
   ```

2. **Environment Variables**
   ```typescript
   // Set test environment variables
   process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
   ```

3. **Async Issues**
   ```typescript
   // Ensure proper async/await usage
   const response = await GET(request);
   expect(response.status).toBe(302);
   ```

## Future Test Enhancements

1. **Performance Testing**
   - Load testing for authentication endpoints
   - Token processing performance
   - Database query optimization

2. **Security Testing**
   - Penetration testing scenarios
   - Rate limiting validation
   - Token replay attack prevention

3. **Browser Testing**
   - Cross-browser compatibility
   - Mobile device testing
   - Email client testing

## Maintenance

- **Review monthly** for new edge cases
- **Update when authentication flow changes**
- **Add tests for new user types or flows**
- **Monitor test execution time and optimize as needed**

---

**Last Updated**: August 2024  
**Test Count**: 45+ test cases  
**Coverage**: 95%+ for authentication flows
