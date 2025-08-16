/**
 * @jest-environment node
 */

// Mock Next.js dependencies first
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

// Mock NextResponse with a simpler structure
const mockRedirect = jest.fn();
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string) {}
    get headers() {
      return new Map();
    }
  },
  NextResponse: {
    redirect: mockRedirect,
  },
}));

import { GET } from '@/app/auth/callback/route';

const mockCookieStore = {
  getAll: jest.fn(() => []),
  set: jest.fn(),
};

const mockSupabaseClient = {
  auth: {
    exchangeCodeForSession: jest.fn(),
    verifyOtp: jest.fn(),
    getUser: jest.fn(),
  },
};

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

describe('/auth/callback API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedirect.mockReturnValue({
      status: 302,
      headers: {
        get: jest.fn((name: string) => name === 'location' ? 'mocked-redirect-url' : null),
      },
    });
    
    const { cookies } = require('next/headers');
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    
    const { createServerClient } = require('@supabase/ssr');
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('PKCE Magic Link Authentication', () => {
    it('should successfully handle PKCE token authentication', async () => {
      // Mock successful session exchange
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user-id', email: 'test@example.com' } },
        error: null,
      });

      // Create request with PKCE token
      const { NextRequest } = require('next/server');
      const request = new NextRequest('https://portantonio.co/auth/callback?token=pkce_12345abcdef&type=signup');

      const response = await GET(request);

      expect(response.status).toBe(302); // Redirect
      expect(mockRedirect).toHaveBeenCalledWith('https://portantonio.co/dashboard');
      expect(mockSupabaseClient.auth.exchangeCodeForSession).toHaveBeenCalledWith('pkce_12345abcdef');
    });

    it('should handle PKCE token authentication errors', async () => {
      // Mock failed session exchange
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: null,
        error: new Error('Invalid PKCE token'),
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?token=pkce_invalid&type=signup');

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/sign-in?error=');
      expect(response.headers.get('location')).toContain('Invalid%20PKCE%20token');
    });

    it('should detect PKCE tokens correctly', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'test-user' } } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null,
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?token=pkce_abcdef123456&type=signup');

      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('🔑 PKCE token detected - attempting session exchange')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('OAuth/PKCE Code Flow', () => {
    it('should handle authorization code exchange', async () => {
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'oauth-user' } } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'oauth-user', email: 'oauth@example.com' } },
        error: null,
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?code=auth_code_12345');

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('https://portantonio.co/dashboard');
      expect(mockSupabaseClient.auth.exchangeCodeForSession).toHaveBeenCalledWith('auth_code_12345');
    });

    it('should handle authorization code exchange errors', async () => {
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: null,
        error: new Error('Invalid authorization code'),
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?code=invalid_code');

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/sign-in?error=');
      expect(response.headers.get('location')).toContain('Invalid%20authorization%20code');
    });
  });

  describe('Traditional OTP Verification', () => {
    it('should handle traditional OTP tokens', async () => {
      mockSupabaseClient.auth.verifyOtp.mockResolvedValue({
        data: { user: { id: 'otp-user' } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'otp-user', email: 'otp@example.com' } },
        error: null,
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?token=regular_token_123&type=recovery');

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('https://portantonio.co/dashboard');
      expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'regular_token_123',
        type: 'recovery',
      });
    });

    it('should handle email change verification', async () => {
      mockSupabaseClient.auth.verifyOtp.mockResolvedValue({
        data: { user: { id: 'user-id' } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id', email: 'new@example.com' } },
        error: null,
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?token=email_change_token&type=email_change');

      const response = await GET(request);

      expect(mockSupabaseClient.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'email_change_token',
        type: 'email_change',
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing parameters gracefully', async () => {
      const request = new NextRequest('https://portantonio.co/auth/callback');

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/sign-in?error=');
      expect(response.headers.get('location')).toContain('Magic%20link%20expired%20or%20invalid');
    });

    it('should handle unknown verification types', async () => {
      const request = new NextRequest('https://portantonio.co/auth/callback?token=some_token&type=unknown');

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/sign-in?error=');
      expect(response.headers.get('location')).toContain('Unsupported%20verification%20type');
    });

    it('should handle Supabase client creation errors', async () => {
      const { createServerClient } = require('@supabase/ssr');
      (createServerClient as jest.Mock).mockImplementation(() => {
        throw new Error('Supabase connection failed');
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?token=pkce_12345&type=signup');

      await expect(GET(request)).rejects.toThrow('Supabase connection failed');
    });
  });

  describe('User Profile Creation', () => {
    beforeEach(() => {
      // Mock fetch for profile creation
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should create tutor profile for non-student users', async () => {
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'tutor-id' } } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'tutor-id', 
            email: 'tutor@example.com',
            user_metadata: { role: 'tutor' }
          } 
        },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?code=auth_code');

      await GET(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://portantonio.co/api/tutors/create',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'tutor-id',
            email: 'tutor@example.com',
          }),
        })
      );
    });

    it('should create student profile for student users', async () => {
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'student-id' } } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { 
          user: { 
            id: 'student-id', 
            email: 'student@example.com',
            user_metadata: { role: 'student' }
          } 
        },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?token=pkce_12345&type=signup&next=/student/dashboard');

      await GET(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://portantonio.co/api/students/create-account',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'student-id',
            email: 'student@example.com',
            fullName: 'student',
            role: 'student',
            studentId: null,
          }),
        })
      );
    });

    it('should handle profile creation failures gracefully', async () => {
      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'user-id' } } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-id', email: 'user@example.com' } },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const request = new NextRequest('https://portantonio.co/auth/callback?code=auth_code');

      const response = await GET(request);

      // Should still redirect to dashboard even if profile creation fails
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('https://portantonio.co/dashboard');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create tutor profile, but proceeding with login')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Logging and Debugging', () => {
    it('should log comprehensive debugging information', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      mockSupabaseClient.auth.exchangeCodeForSession.mockResolvedValue({
        data: { session: { user: { id: 'debug-user' } } },
        error: null,
      });

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: { id: 'debug-user', email: 'debug@example.com' } },
        error: null,
      });

      const request = new NextRequest('https://portantonio.co/auth/callback?token=pkce_debug123&type=signup&next=/custom');

      await GET(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔍 AUTH CALLBACK DEBUGGING:',
        expect.objectContaining({
          timestamp: expect.any(String),
          fullUrl: 'https://portantonio.co/auth/callback?token=pkce_debug123&type=signup&next=/custom',
          origin: 'https://portantonio.co',
          domain: 'portantonio.co',
          code: 'missing',
          token: 'present (type: PKCE, pkce_debug123...)',
          type: 'signup',
          next: '/custom',
          allParams: {
            token: 'pkce_debug123',
            type: 'signup',
            next: '/custom',
          },
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
