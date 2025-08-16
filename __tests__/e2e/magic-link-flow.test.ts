import { GET } from '@/app/auth/callback/route';
import {
  createMockSupabaseClient,
  createTestUser,
  createCallbackRequest,
  createPKCEToken,
  createAuthCode,
  mockSuccessfulPKCEExchange,
  mockFailedPKCEExchange,
  mockSuccessfulOTPVerification,
  mockProfileCreationAPI,
  expectSuccessRedirect,
  expectErrorRedirect,
  setupTestEnvironment,
  expectDebugLog,
} from '../utils/auth-test-helpers';

// Mock dependencies
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    getAll: () => [],
    set: jest.fn(),
  }),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

describe('Magic Link E2E Flow Tests', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;
  let testEnv: ReturnType<typeof setupTestEnvironment>;

  beforeEach(() => {
    mockClient = createMockSupabaseClient();
    testEnv = setupTestEnvironment();
    
    const { createServerClient } = require('@supabase/ssr');
    (createServerClient as jest.Mock).mockReturnValue(mockClient);
    
    mockProfileCreationAPI(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    testEnv.cleanup();
    (global.fetch as jest.Mock)?.mockRestore?.();
  });

  describe('Complete PKCE Magic Link Flow', () => {
    it('should handle complete tutor signup via PKCE magic link', async () => {
      // Arrange
      const tutorUser = createTestUser({
        id: 'tutor-123',
        email: 'tutor@example.com',
        user_metadata: { role: 'tutor', full_name: 'John Tutor' },
      });

      mockSuccessfulPKCEExchange(mockClient, tutorUser);
      
      const request = createCallbackRequest({
        token: createPKCEToken('tutor_signup_token'),
        type: 'signup',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/dashboard');
      
      expect(mockClient.auth.exchangeCodeForSession).toHaveBeenCalledWith(
        createPKCEToken('tutor_signup_token')
      );
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://portantonio.co/api/tutors/create',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'tutor-123',
            email: 'tutor@example.com',
          }),
        })
      );

      expectDebugLog(testEnv.consoleSpy.log, {
        token: expect.stringContaining('present (type: PKCE'),
        type: 'signup',
      });
    });

    it('should handle complete student signup via PKCE magic link', async () => {
      // Arrange
      const studentUser = createTestUser({
        id: 'student-456',
        email: 'student@example.com',
        user_metadata: { role: 'student', full_name: 'Jane Student' },
      });

      mockSuccessfulPKCEExchange(mockClient, studentUser);
      
      const request = createCallbackRequest({
        token: createPKCEToken('student_signup_token'),
        type: 'signup',
        next: '/student/dashboard',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/student/dashboard');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://portantonio.co/api/students/create-account',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'student-456',
            email: 'student@example.com',
            fullName: 'Jane Student',
            role: 'student',
            studentId: null,
          }),
        })
      );
    });

    it('should handle parent signup via PKCE magic link', async () => {
      // Arrange
      const parentUser = createTestUser({
        id: 'parent-789',
        email: 'parent@example.com',
        user_metadata: { 
          role: 'parent', 
          full_name: 'Parent Name',
          student_id: 'child-123',
        },
      });

      mockSuccessfulPKCEExchange(mockClient, parentUser);
      
      const request = createCallbackRequest({
        token: createPKCEToken('parent_signup_token'),
        type: 'signup',
        next: '/student/dashboard',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/student/dashboard');
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://portantonio.co/api/students/create-account',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'parent-789',
            email: 'parent@example.com',
            fullName: 'Parent Name',
            role: 'parent',
            studentId: 'child-123',
          }),
        })
      );
    });
  });

  describe('OAuth/PKCE Code Flow', () => {
    it('should handle OAuth authorization code exchange', async () => {
      // Arrange
      const user = createTestUser({ id: 'oauth-user' });
      mockSuccessfulPKCEExchange(mockClient, user);
      
      const request = createCallbackRequest({
        code: createAuthCode('oauth_authorization_code'),
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/dashboard');
      
      expect(mockClient.auth.exchangeCodeForSession).toHaveBeenCalledWith(
        createAuthCode('oauth_authorization_code')
      );
    });
  });

  describe('Traditional OTP Flow', () => {
    it('should handle email recovery via traditional OTP', async () => {
      // Arrange
      const user = createTestUser({ id: 'recovery-user' });
      mockSuccessfulOTPVerification(mockClient, user);
      
      const request = createCallbackRequest({
        token: 'traditional_otp_token_123',
        type: 'recovery',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/dashboard');
      
      expect(mockClient.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'traditional_otp_token_123',
        type: 'recovery',
      });
    });

    it('should handle email change confirmation', async () => {
      // Arrange
      const user = createTestUser({ email: 'newemail@example.com' });
      mockSuccessfulOTPVerification(mockClient, user);
      
      const request = createCallbackRequest({
        token: 'email_change_token_456',
        type: 'email_change',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/dashboard');
      
      expect(mockClient.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'email_change_token_456',
        type: 'email_change',
      });
    });
  });

  describe('Error Scenarios', () => {
    it('should handle expired PKCE tokens', async () => {
      // Arrange
      mockFailedPKCEExchange(mockClient, 'Token has expired');
      
      const request = createCallbackRequest({
        token: createPKCEToken('expired_token'),
        type: 'signup',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectErrorRedirect(response, 'Token has expired');
    });

    it('should handle invalid PKCE tokens', async () => {
      // Arrange
      mockFailedPKCEExchange(mockClient, 'Invalid token format');
      
      const request = createCallbackRequest({
        token: createPKCEToken('invalid_format'),
        type: 'signup',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectErrorRedirect(response, 'Invalid token format');
    });

    it('should handle profile creation failures gracefully', async () => {
      // Arrange
      const user = createTestUser();
      mockSuccessfulPKCEExchange(mockClient, user);
      mockProfileCreationAPI(false); // Simulate API failure
      
      const request = createCallbackRequest({
        token: createPKCEToken('valid_token'),
        type: 'signup',
      });

      // Act
      const response = await GET(request);

      // Assert
      // Should still succeed even if profile creation fails
      expectSuccessRedirect(response, '/dashboard');
      
      expect(testEnv.consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create tutor profile, but proceeding with login')
      );
    });

    it('should handle existing profile gracefully', async () => {
      // Arrange
      const user = createTestUser();
      mockSuccessfulPKCEExchange(mockClient, user);
      mockProfileCreationAPI(true, true); // Existing profile (409)
      
      const request = createCallbackRequest({
        token: createPKCEToken('valid_token'),
        type: 'signup',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/dashboard');
      
      expect(testEnv.consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Tutor profile already exists')
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing parameters', async () => {
      // Arrange
      const request = createCallbackRequest({});

      // Act
      const response = await GET(request);

      // Assert
      expectErrorRedirect(response, 'Magic link expired or invalid');
    });

    it('should handle unknown verification types', async () => {
      // Arrange
      const request = createCallbackRequest({
        token: 'some_token',
        type: 'unknown_type',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectErrorRedirect(response, 'Unsupported verification type');
    });

    it('should handle malformed PKCE tokens', async () => {
      // Arrange
      mockFailedPKCEExchange(mockClient, 'Malformed token');
      
      const request = createCallbackRequest({
        token: 'pkce_malformed_token_!@#',
        type: 'signup',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectErrorRedirect(response, 'Malformed token');
    });
  });

  describe('Custom Redirect Paths', () => {
    it('should respect custom next parameter', async () => {
      // Arrange
      const user = createTestUser();
      mockSuccessfulPKCEExchange(mockClient, user);
      
      const request = createCallbackRequest({
        token: createPKCEToken('valid_token'),
        type: 'signup',
        next: '/custom/redirect/path',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/custom/redirect/path');
    });

    it('should default to dashboard when no next parameter', async () => {
      // Arrange
      const user = createTestUser();
      mockSuccessfulPKCEExchange(mockClient, user);
      
      const request = createCallbackRequest({
        token: createPKCEToken('valid_token'),
        type: 'signup',
      });

      // Act
      const response = await GET(request);

      // Assert
      expectSuccessRedirect(response, '/dashboard');
    });
  });

  describe('Logging and Debugging', () => {
    it('should log comprehensive debugging information for PKCE flow', async () => {
      // Arrange
      const user = createTestUser();
      mockSuccessfulPKCEExchange(mockClient, user);
      
      const request = createCallbackRequest({
        baseUrl: 'https://portantonio.co',
        token: createPKCEToken('debug_token'),
        type: 'signup',
        next: '/debug/path',
      });

      // Act
      await GET(request);

      // Assert
      expectDebugLog(testEnv.consoleSpy.log, {
        fullUrl: 'https://portantonio.co/auth/callback?token=pkce_debug_token&type=signup&next=%2Fdebug%2Fpath',
        origin: 'https://portantonio.co',
        domain: 'portantonio.co',
        code: 'missing',
        token: 'present (type: PKCE, pkce_debug_toke...)',
        type: 'signup',
        next: '/debug/path',
      });

      expect(testEnv.consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('🔑 PKCE token detected - attempting session exchange')
      );

      expect(testEnv.consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ PKCE session exchange successful')
      );
    });
  });
});
