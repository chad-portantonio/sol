import { NextRequest } from 'next/server';

/**
 * Test utilities for authentication testing
 */

export interface MockSupabaseClient {
  auth: {
    exchangeCodeForSession: jest.Mock;
    verifyOtp: jest.Mock;
    getUser: jest.Mock;
    getSession: jest.Mock;
    signInWithOtp: jest.Mock;
    signOut: jest.Mock;
  };
}

export interface TestUser {
  id: string;
  email: string;
  user_metadata?: {
    role?: 'tutor' | 'student' | 'parent';
    full_name?: string;
    student_id?: string;
  };
}

export interface TestSession {
  user: TestUser;
  access_token: string;
  expires_at?: number;
}

/**
 * Creates a mock Supabase client for testing
 */
export const createMockSupabaseClient = (): MockSupabaseClient => ({
  auth: {
    exchangeCodeForSession: jest.fn(),
    verifyOtp: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    signInWithOtp: jest.fn(),
    signOut: jest.fn(),
  },
});

/**
 * Creates a test user object
 */
export const createTestUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    role: 'tutor',
    full_name: 'Test User',
  },
  ...overrides,
});

/**
 * Creates a test session object
 */
export const createTestSession = (user?: TestUser): TestSession => ({
  user: user || createTestUser(),
  access_token: 'mock-access-token',
  expires_at: Date.now() + 3600000, // 1 hour from now
});

/**
 * Creates a NextRequest for testing callback routes
 */
export const createCallbackRequest = (params: {
  baseUrl?: string;
  code?: string;
  token?: string;
  type?: string;
  next?: string;
}): NextRequest => {
  const {
    baseUrl = 'https://portantonio.co',
    code,
    token,
    type,
    next,
  } = params;

  const url = new URL('/auth/callback', baseUrl);
  
  if (code) url.searchParams.set('code', code);
  if (token) url.searchParams.set('token', token);
  if (type) url.searchParams.set('type', type);
  if (next) url.searchParams.set('next', next);

  return new NextRequest(url.toString());
};

/**
 * Creates a PKCE token for testing
 */
export const createPKCEToken = (suffix = 'abcdef123456'): string => {
  return `pkce_${suffix}`;
};

/**
 * Creates an authorization code for testing
 */
export const createAuthCode = (suffix = 'auth123456'): string => {
  return `${suffix}`;
};

/**
 * Mock successful PKCE session exchange
 */
export const mockSuccessfulPKCEExchange = (
  client: MockSupabaseClient,
  user: TestUser = createTestUser()
) => {
  client.auth.exchangeCodeForSession.mockResolvedValue({
    data: { session: createTestSession(user) },
    error: null,
  });

  client.auth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });
};

/**
 * Mock failed PKCE session exchange
 */
export const mockFailedPKCEExchange = (
  client: MockSupabaseClient,
  errorMessage = 'Invalid PKCE token'
) => {
  client.auth.exchangeCodeForSession.mockResolvedValue({
    data: null,
    error: new Error(errorMessage),
  });
};

/**
 * Mock successful OTP verification
 */
export const mockSuccessfulOTPVerification = (
  client: MockSupabaseClient,
  user: TestUser = createTestUser()
) => {
  client.auth.verifyOtp.mockResolvedValue({
    data: { user },
    error: null,
  });

  client.auth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });
};

/**
 * Mock failed OTP verification
 */
export const mockFailedOTPVerification = (
  client: MockSupabaseClient,
  errorMessage = 'Invalid OTP token'
) => {
  client.auth.verifyOtp.mockResolvedValue({
    data: null,
    error: new Error(errorMessage),
  });
};

/**
 * Mock profile creation API responses
 */
export const mockProfileCreationAPI = (success = true, existingProfile = false) => {
  const status = success ? (existingProfile ? 409 : 200) : 500;
  
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
    ok: success,
    status,
    json: () => Promise.resolve({
      id: existingProfile ? 'existing-profile-id' : 'new-profile-id',
      message: existingProfile ? 'Profile already exists' : 'Profile created successfully',
    }),
  });
};

/**
 * Assertion helpers for testing redirects
 */
export const expectRedirectTo = (response: Response, expectedPath: string) => {
  expect(response.status).toBe(302);
  const location = response.headers.get('location');
  expect(location).toContain(expectedPath);
  return location;
};

export const expectErrorRedirect = (response: Response, errorMessage?: string) => {
  const location = expectRedirectTo(response, '/sign-in?error=');
  if (errorMessage) {
    expect(location).toContain(encodeURIComponent(errorMessage));
  }
  return location;
};

export const expectSuccessRedirect = (response: Response, path = '/dashboard') => {
  return expectRedirectTo(response, path);
};

/**
 * Console log assertion helpers
 */
export const expectLogMessage = (spy: jest.SpyInstance, expectedMessage: string) => {
  expect(spy).toHaveBeenCalledWith(
    expect.stringContaining(expectedMessage)
  );
};

export const expectDebugLog = (spy: jest.SpyInstance, expectedData: Record<string, any>) => {
  expect(spy).toHaveBeenCalledWith(
    '🔍 AUTH CALLBACK DEBUGGING:',
    expect.objectContaining(expectedData)
  );
};

/**
 * Test environment setup helpers
 */
export const setupTestEnvironment = () => {
  // Set up environment variables
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
  
  // Mock console methods
  const consoleSpy = {
    log: jest.spyOn(console, 'log').mockImplementation(),
    warn: jest.spyOn(console, 'warn').mockImplementation(),
    error: jest.spyOn(console, 'error').mockImplementation(),
  };

  return {
    consoleSpy,
    cleanup: () => {
      consoleSpy.log.mockRestore();
      consoleSpy.warn.mockRestore();
      consoleSpy.error.mockRestore();
    },
  };
};

/**
 * Magic link URL patterns for testing
 */
export const MAGIC_LINK_PATTERNS = {
  PKCE_SIGNUP: /https:\/\/[^.]+\.supabase\.co\/auth\/v1\/verify\?token=pkce_[a-f0-9]+&type=signup&redirect_to=.+/,
  PKCE_RECOVERY: /https:\/\/[^.]+\.supabase\.co\/auth\/v1\/verify\?token=pkce_[a-f0-9]+&type=recovery&redirect_to=.+/,
  TRADITIONAL_OTP: /https:\/\/[^.]+\.supabase\.co\/auth\/v1\/verify\?token=[a-f0-9]+&type=signup&redirect_to=.+/,
};

/**
 * Validates magic link URL structure
 */
export const validateMagicLinkURL = (url: string, type: 'PKCE_SIGNUP' | 'PKCE_RECOVERY' | 'TRADITIONAL_OTP') => {
  const pattern = MAGIC_LINK_PATTERNS[type];
  return pattern.test(url);
};
