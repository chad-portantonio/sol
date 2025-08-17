/**
 * Tests for the unified authentication callback flow
 * Covers both tutor and student authentication paths
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/auth/callback/route';

// Mock dependencies
jest.mock('@supabase/ssr');
jest.mock('next/headers');

// Mock NextResponse.redirect
const mockRedirect = jest.fn().mockImplementation((url: string) => ({
  status: 302,
  headers: new Map([['location', url]]),
}));

jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    redirect: mockRedirect,
  },
}));

// Mock fetch for API calls
global.fetch = jest.fn();

const mockSupabase = {
  auth: {
    exchangeCodeForSession: jest.fn(),
    getUser: jest.fn(),
  },
};

const mockCookies = jest.fn().mockResolvedValue({
  getAll: jest.fn(() => []),
  set: jest.fn(),
});

const mockCreateServerClient = jest.fn(() => mockSupabase);

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  (require('@supabase/ssr').createServerClient as jest.Mock) = mockCreateServerClient;
  (require('next/headers').cookies as jest.Mock) = mockCookies;
});

describe('Auth Callback - Unified Flow', () => {
  const mockOrigin = 'https://nova.example.com';
  
  describe('Student Authentication Flow', () => {
    it('should handle independent student registration successfully', async () => {
      // Mock successful code exchange
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      // Mock user data with student metadata
      const mockUser = {
        id: 'student-auth-123',
        email: 'student@example.com',
        user_metadata: {
          full_name: 'Test Student',
          role: 'student',
          preferred_subjects: ['Mathematics', 'Science'],
          grade_level: 'Grade 11',
          bio: 'Excited to learn!',
        },
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock successful student account creation
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          message: 'Student account created successfully',
          student: { id: 'student-123' }
        }),
      });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code&next=/student/dashboard`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      // Should redirect to student dashboard
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}/student/dashboard`);

      // Verify student account creation was called
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockOrigin}/api/student-accounts/create`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'student-auth-123',
            email: 'student@example.com',
            fullName: 'Test Student',
            preferredSubjects: ['Mathematics', 'Science'],
            gradeLevel: 'Grade 11',
            bio: 'Excited to learn!',
            role: 'student',
            studentId: null,
          }),
        })
      );
    });

    it('should handle parent registration successfully', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'parent-auth-123',
        email: 'parent@example.com',
        user_metadata: {
          full_name: 'Test Parent',
          role: 'parent',
          student_id: 'student-456',
        },
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          message: 'Parent account created successfully',
          parent: { id: 'parent-123' }
        }),
      });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code&next=/student/dashboard`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}/student/dashboard`);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockOrigin}/api/student-accounts/create`,
        expect.objectContaining({
          body: JSON.stringify({
            userId: 'parent-auth-123',
            email: 'parent@example.com',
            fullName: 'Test Parent',
            preferredSubjects: [],
            gradeLevel: null,
            bio: null,
            role: 'parent',
            studentId: 'student-456',
          }),
        })
      );
    });

    it('should handle existing student account gracefully', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'existing-student-auth',
        email: 'existing@example.com',
        user_metadata: { role: 'student', full_name: 'Existing Student' },
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock 409 response (account already exists)
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          message: 'Student account already exists',
          student: { id: 'existing-student' }
        }),
      });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code&next=/student/dashboard`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      // Should still proceed with authentication
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}/student/dashboard`);
    });
  });

  describe('Tutor Authentication Flow', () => {
    it('should handle tutor registration successfully', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'tutor-auth-123',
        email: 'tutor@example.com',
        user_metadata: {
          full_name: 'Test Tutor',
          // No role specified, defaults to tutor
        },
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          message: 'Tutor record created successfully',
          tutor: { id: 'tutor-123' }
        }),
      });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code&next=/dashboard`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}/dashboard`);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockOrigin}/api/tutors/create`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'tutor-auth-123',
            email: 'tutor@example.com',
          }),
        })
      );
    });

    it('should handle existing tutor account gracefully', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'existing-tutor-auth',
        email: 'existing-tutor@example.com',
        user_metadata: {},
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 409,
        json: () => Promise.resolve({
          message: 'Tutor record already exists',
          tutor: { id: 'existing-tutor' }
        }),
      });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code&next=/dashboard`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}/dashboard`);
    });
  });

  describe('Error Handling', () => {
    it('should handle code exchange failures', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
        error: { message: 'Invalid verification code' }
      });

      const url = new URL(`${mockOrigin}/auth/callback?code=invalid-code`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/sign-in?error=');
      expect(response.headers.get('location')).toContain('Authentication%20failed');
    });

    it('should handle missing verification code', async () => {
      const url = new URL(`${mockOrigin}/auth/callback`); // No code parameter
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toContain('/sign-in?error=');
      expect(response.headers.get('location')).toContain('No%20verification%20code%20found');
    });

    it('should continue authentication even if account creation fails', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { role: 'student' },
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock account creation failure
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          error: 'Database error'
        }),
      });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code&next=/student/dashboard`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      // Should still redirect to dashboard
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}/student/dashboard`);
    });

    it('should handle account creation network errors gracefully', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'user-456',
        email: 'networktest@example.com',
        user_metadata: { role: 'student' },
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock network error
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code&next=/student/dashboard`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      // Should still proceed with authentication
      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}/student/dashboard`);
    });
  });

  describe('Role Detection and Routing', () => {
    it('should detect student role from user metadata', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'role-test-student',
        email: 'roletest@example.com',
        user_metadata: { role: 'student' },
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code`);
      const request = { url: url.toString() } as NextRequest;

      await GET(request);

      // Verify student API was called
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockOrigin}/api/student-accounts/create`,
        expect.any(Object)
      );
    });

    it('should detect parent role from user metadata', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'role-test-parent',
        email: 'parentroletest@example.com',
        user_metadata: { role: 'parent' },
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code`);
      const request = { url: url.toString() } as NextRequest;

      await GET(request);

      // Verify student API was called (parent creation goes through student API)
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockOrigin}/api/student-accounts/create`,
        expect.any(Object)
      );
    });

    it('should default to tutor role when no role specified', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'role-test-tutor',
        email: 'tutorroletest@example.com',
        user_metadata: {}, // No role specified
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code`);
      const request = { url: url.toString() } as NextRequest;

      await GET(request);

      // Verify tutor API was called
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockOrigin}/api/tutors/create`,
        expect.any(Object)
      );
    });
  });

  describe('Next Parameter Handling', () => {
    it('should respect custom next parameter', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'next-test',
        email: 'nexttest@example.com',
        user_metadata: {},
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      const customNext = '/custom/dashboard';
      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code&next=${encodeURIComponent(customNext)}`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}${customNext}`);
    });

    it('should default to /dashboard when no next parameter', async () => {
      mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({ error: null });
      
      const mockUser = {
        id: 'default-next-test',
        email: 'defaultnext@example.com',
        user_metadata: {},
      };
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

      const url = new URL(`${mockOrigin}/auth/callback?code=valid-code`);
      const request = { url: url.toString() } as NextRequest;

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe(`${mockOrigin}/dashboard`);
    });
  });
});
