import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import SignUpPage from '@/app/(auth)/sign-up/page'

// Mock the createBrowserClient
const mockSignUp = jest.fn()
const mockSupabaseClient = {
  auth: {
    signUp: mockSignUp,
  },
}

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => mockSupabaseClient),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('SignUpPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignUp.mockClear()
    mockPush.mockClear()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Rendering', () => {
    it('renders sign up form with all required elements', () => {
      render(<SignUpPage />)
      
      expect(screen.getByText('Create your account')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument()
    })

    it('displays Nova branding', () => {
      render(<SignUpPage />)
      
      expect(screen.getByText('Nova')).toBeInTheDocument()
    })

    it('has correct navigation links', () => {
      render(<SignUpPage />)
      
      const signInLink = screen.getByText('sign in to your existing account')
      expect(signInLink.closest('a')).toHaveAttribute('href', '/sign-in')
      
      const homeLink = screen.getByText('← Back to home')
      expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    })
  })

  describe('Form Validation', () => {
    it('shows form validation for required fields', async () => {
      render(<SignUpPage />)
      
      const submitButton = screen.getByRole('button', { name: 'Create account' })
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByLabelText('Email address')).toBeInvalid()
        expect(screen.getByLabelText('Password')).toBeInvalid()
        expect(screen.getByLabelText('Confirm Password')).toBeInvalid()
      })
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<SignUpPage />)
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })
      
      await user.type(emailInput, 'invalid-email')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(emailInput).toBeInvalid()
      })
    })

    it('validates password confirmation match', async () => {
      const user = userEvent.setup()
      render(<SignUpPage />)
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      
      fireEvent.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument()
      })
    })

    it('prevents submission with mismatched passwords', async () => {
      const user = userEvent.setup()
      render(<SignUpPage />)
      
      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })
      
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      
      fireEvent.click(submitButton)
      
      // Should not call Supabase or any API
      expect(mockSignUp).not.toHaveBeenCalled()
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Complete Sign-up Flow', () => {
    it('should create tutor account and call API endpoints correctly', async () => {
      const user = userEvent.setup()
      const testUserId = `test-user-${Date.now()}`
      const testEmail = `test-${Date.now()}@example.com`

      // Mock successful Supabase signup
      mockSignUp.mockResolvedValue({
        error: null,
        data: {
          user: {
            id: testUserId,
            email: testEmail,
            email_confirmed_at: null,
          },
        },
      })

      // Mock successful API call to create tutor
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          message: 'Tutor record created successfully',
          tutor: {
            id: 'tutor123',
            userId: testUserId,
            email: testEmail,
          },
        }),
      })

      render(<SignUpPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })

      await user.type(emailInput, testEmail)
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Wait for the signup process to complete
      await waitFor(() => {
        expect(screen.getByText(/Account created! Please check your email/i)).toBeInTheDocument()
      })

      // Verify Supabase was called first
      expect(mockSignUp).toHaveBeenCalledTimes(1)
      expect(mockSignUp).toHaveBeenCalledWith({
        email: testEmail,
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      })

      // Verify tutor creation API was called
      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(global.fetch).toHaveBeenCalledWith('/api/tutors/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: testUserId,
          email: testEmail,
        }),
      })

      // Verify form was cleared
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
      expect(confirmPasswordInput).toHaveValue('')
    })

    it('should handle database insertion failure gracefully', async () => {
      const user = userEvent.setup()
      const testUserId = `test-user-${Date.now()}`
      const testEmail = `test-${Date.now()}@example.com`

      // Mock successful Supabase signup
      mockSignUp.mockResolvedValue({
        error: null,
        data: {
          user: {
            id: testUserId,
            email: testEmail,
            email_confirmed_at: null,
          },
        },
      })

      // Mock failed API call to create tutor
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Database error' }),
      })

      render(<SignUpPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })

      await user.type(emailInput, testEmail)
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Should still show success message even if database creation fails
      await waitFor(() => {
        expect(screen.getByText(/Account created! Please check your email/i)).toBeInTheDocument()
      })

      // Verify API was called despite the failure
      expect(global.fetch).toHaveBeenCalledWith('/api/tutors/create', expect.any(Object))
    })

    it('should handle network errors during tutor creation', async () => {
      const user = userEvent.setup()
      const testUserId = `test-user-${Date.now()}`
      const testEmail = `test-${Date.now()}@example.com`

      // Mock successful Supabase signup
      mockSignUp.mockResolvedValue({
        error: null,
        data: {
          user: {
            id: testUserId,
            email: testEmail,
            email_confirmed_at: null,
          },
        },
      })

      // Mock network error during API call
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      render(<SignUpPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })

      await user.type(emailInput, testEmail)
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Should still show success message even if network error occurs
      await waitFor(() => {
        expect(screen.getByText(/Account created! Please check your email/i)).toBeInTheDocument()
      })

      // Verify API was called despite the network error
      expect(global.fetch).toHaveBeenCalledWith('/api/tutors/create', expect.any(Object))
    })
  })

  describe('Error Handling', () => {
    it('should handle Supabase signup errors without making tutor API calls', async () => {
      const user = userEvent.setup()

      // Mock failed Supabase signup
      mockSignUp.mockResolvedValue({
        error: { message: 'Email already exists' },
        data: { user: null },
      })

      render(<SignUpPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })

      await user.type(emailInput, 'existing@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Should show Supabase error
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument()
      })

      // Should not make tutor creation API call
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle unexpected errors gracefully', async () => {
      const user = userEvent.setup()

      // Mock unexpected error
      mockSignUp.mockRejectedValue(new Error('Unexpected error'))

      render(<SignUpPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })

      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Should show generic error message
      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
      })

      // Should not make tutor creation API call
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('User Experience', () => {
    it('should redirect already confirmed users to sign-in', async () => {
      const user = userEvent.setup()
      const testUserId = `test-user-${Date.now()}`
      const testEmail = `test-${Date.now()}@example.com`

      // Mock Supabase signup with already confirmed email
      mockSignUp.mockResolvedValue({
        error: null,
        data: {
          user: {
            id: testUserId,
            email: testEmail,
            email_confirmed_at: '2024-01-01T00:00:00Z',
          },
        },
      })

      render(<SignUpPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })

      await user.type(emailInput, testEmail)
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Should redirect to sign-in for already confirmed users
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/sign-in?message=Account created successfully! You can now sign in.')
      })

      // Should not make tutor creation API call for already confirmed users
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should show loading state during signup', async () => {
      const user = userEvent.setup()
      const testEmail = `test-${Date.now()}@example.com`

      // Mock slow Supabase signup
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignUpPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })

      await user.type(emailInput, testEmail)
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      // Should show loading state
      expect(screen.getByText('Creating account...')).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
    })

    it('should clear form after successful signup', async () => {
      const user = userEvent.setup()
      const testUserId = `test-user-${Date.now()}`
      const testEmail = `test-${Date.now()}@example.com`

      mockSignUp.mockResolvedValue({
        error: null,
        data: {
          user: {
            id: testUserId,
            email: testEmail,
            email_confirmed_at: null,
          },
        },
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Success' }),
      })

      render(<SignUpPage />)

      const emailInput = screen.getByLabelText('Email address')
      const passwordInput = screen.getByLabelText('Password')
      const confirmPasswordInput = screen.getByLabelText('Confirm Password')
      const submitButton = screen.getByRole('button', { name: 'Create account' })

      await user.type(emailInput, testEmail)
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Account created! Please check your email/i)).toBeInTheDocument()
      })

      // Form should be cleared after successful signup
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
      expect(confirmPasswordInput).toHaveValue('')
    })
  })
})

