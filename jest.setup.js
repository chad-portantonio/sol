import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.STRIPE_SECRET_KEY = 'sk_test_test'
process.env.RESEND_API_KEY = 'test-resend-key'

// Mock Supabase
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
  })),
  createServerClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
  })),
}))

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    redirectToCheckout: jest.fn(),
  })),
}))

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}))

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'test-token-123'),
}))

// Global test utilities
global.fetch = jest.fn()

// Mock NextResponse for API routes
jest.mock('next/server', () => ({
  NextRequest: class NextRequest {
    constructor(input, init) {
      return {
        method: init?.method || 'GET',
        url: typeof input === 'string' ? input : 'http://localhost:3000',
        json: jest.fn().mockResolvedValue(init?.body || {}),
        headers: new Map(),
      };
    }
  },
  NextResponse: {
    json: jest.fn((data, init) => ({
      status: init?.status || 200,
      json: jest.fn().mockResolvedValue(data),
      headers: new Map(),
    })),
  },
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})
