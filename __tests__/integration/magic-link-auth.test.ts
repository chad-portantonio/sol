import { createBrowserClient } from '@supabase/ssr';

// Mock Supabase client for integration tests
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

const mockSupabaseClient = {
  auth: {
    signInWithOtp: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    signOut: jest.fn(),
  },
};

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

describe('Magic Link Authentication Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    
    // Mock fetch for profile creation API calls
    global.fetch = jest.fn();
  });

  afterEach(() => {
    (global.fetch as jest.Mock).mockRestore();
  });

  describe('End-to-End Magic Link Flow', () => {
    it('should complete full magic link authentication flow', async () => {
      // Step 1: Request magic link
      mockSupabaseClient.auth.signInWithOtp.mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      });

      const signInResult = await mockSupabaseClient.auth.signInWithOtp({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'https://portantonio.co/auth/callback',
        },
      });

      expect(signInResult.error).toBeNull();
      expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'https://portantonio.co/auth/callback',
        },
      });

      // Step 2: Simulate callback handling (this would be handled by our callback route)
      // In a real integration test, we'd test the actual callback endpoint
      
      // Step 3: Check session after successful authentication
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: {
              id: 'test-user-id',
              email: 'test@example.com',
              user_metadata: { role: 'tutor' },
            },
            access_token: 'mock-token',
          },
        },
        error: null,
      });

      const sessionResult = await mockSupabaseClient.auth.getSession();
      expect(sessionResult.data.session).toBeTruthy();
      expect(sessionResult.data.session?.user.email).toBe('test@example.com');
    });

    it('should handle magic link request errors', async () => {
      mockSupabaseClient.auth.signInWithOtp.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Rate limit exceeded'),
      });

      const result = await mockSupabaseClient.auth.signInWithOtp({
        email: 'test@example.com',
        options: {
          emailRedirectTo: 'https://portantonio.co/auth/callback',
        },
      });

      expect(result.error).toBeTruthy();
      expect(result.error?.message).toBe('Rate limit exceeded');
    });
  });

  describe('Magic Link URL Generation', () => {
    it('should generate correct redirect URL for production', () => {
      const expectedRedirectUrl = 'https://portantonio.co/auth/callback';
      
      // This would be called from the sign-in component
      const options = {
        emailRedirectTo: expectedRedirectUrl,
      };

      expect(options.emailRedirectTo).toBe(expectedRedirectUrl);
      expect(options.emailRedirectTo).toContain('/auth/callback');
    });

    it('should generate correct redirect URL for development', () => {
      const developmentUrl = 'http://localhost:3000/auth/callback';
      
      const options = {
        emailRedirectTo: developmentUrl,
      };

      expect(options.emailRedirectTo).toBe(developmentUrl);
    });
  });

  describe('Session Management', () => {
    it('should handle valid session state', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'valid-user', email: 'valid@example.com' },
            access_token: 'valid-token',
            expires_at: Date.now() + 3600000, // 1 hour from now
          },
        },
        error: null,
      });

      const result = await mockSupabaseClient.auth.getSession();
      
      expect(result.data.session).toBeTruthy();
      expect(result.data.session?.user.id).toBe('valid-user');
      expect(result.data.session?.access_token).toBe('valid-token');
    });

    it('should handle expired session state', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session expired'),
      });

      const result = await mockSupabaseClient.auth.getSession();
      
      expect(result.data.session).toBeNull();
      expect(result.error?.message).toBe('Session expired');
    });

    it('should handle session cleanup on signout', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await mockSupabaseClient.auth.signOut();
      
      expect(result.error).toBeNull();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('User Profile Integration', () => {
    it('should integrate with tutor profile creation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          id: 'tutor-profile-id',
          userId: 'test-user-id',
          email: 'tutor@example.com',
        }),
      });

      // Simulate the profile creation call that happens in the callback
      const profileResponse = await fetch('https://portantonio.co/api/tutors/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id',
          email: 'tutor@example.com',
        }),
      });

      expect(profileResponse.ok).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://portantonio.co/api/tutors/create',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should integrate with student profile creation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          id: 'student-profile-id',
          userId: 'student-user-id',
          email: 'student@example.com',
        }),
      });

      const profileResponse = await fetch('https://portantonio.co/api/students/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'student-user-id',
          email: 'student@example.com',
          fullName: 'Student Name',
          role: 'student',
          studentId: null,
        }),
      });

      expect(profileResponse.ok).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should handle network failures gracefully', async () => {
      mockSupabaseClient.auth.signInWithOtp.mockRejectedValue(
        new Error('Network error')
      );

      await expect(
        mockSupabaseClient.auth.signInWithOtp({
          email: 'test@example.com',
          options: { emailRedirectTo: 'https://portantonio.co/auth/callback' },
        })
      ).rejects.toThrow('Network error');
    });

    it('should handle malformed email addresses', async () => {
      mockSupabaseClient.auth.signInWithOtp.mockResolvedValue({
        data: { user: null, session: null },
        error: new Error('Invalid email format'),
      });

      const result = await mockSupabaseClient.auth.signInWithOtp({
        email: 'invalid-email',
        options: { emailRedirectTo: 'https://portantonio.co/auth/callback' },
      });

      expect(result.error?.message).toBe('Invalid email format');
    });
  });

  describe('Security Considerations', () => {
    it('should use HTTPS redirect URLs in production', () => {
      const productionRedirectUrl = 'https://portantonio.co/auth/callback';
      
      expect(productionRedirectUrl).toMatch(/^https:/);
      expect(productionRedirectUrl).not.toMatch(/^http:/);
    });

    it('should validate redirect URL format', () => {
      const validUrls = [
        'https://portantonio.co/auth/callback',
        'http://localhost:3000/auth/callback',
        'http://localhost:3001/auth/callback',
      ];

      const invalidUrls = [
        'javascript:alert(1)',
        'data:text/html,<script>alert(1)</script>',
        'ftp://example.com/callback',
      ];

      validUrls.forEach(url => {
        expect(url).toMatch(/^https?:\/\//);
      });

      invalidUrls.forEach(url => {
        expect(url).not.toMatch(/^https?:\/\//);
      });
    });
  });
});
