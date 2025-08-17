import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignInPage from '@/app/(auth)/sign-in/page'

// Mock the createBrowserClient
const mockSignInWithOtp = jest.fn()
const mockSupabaseClient = {
  auth: {
    signInWithOtp: mockSignInWithOtp,
  },
}

jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => mockSupabaseClient),
}))

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignInWithOtp.mockClear()
  })

  describe('Rendering', () => {
    it('renders sign in form with all required elements', () => {
      render(<SignInPage />)
      
      expect(screen.getByText('Login to your Nova account')).toBeInTheDocument()
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Send magic link' })).toBeInTheDocument()
    })

    it('displays Nova branding', () => {
      render(<SignInPage />)
      
      expect(screen.getByText('Login to your Nova account')).toBeInTheDocument()
    })

    it('has link to sign up page', () => {
      render(<SignInPage />)
      
      const signUpLink = screen.getByText('Sign up')
      expect(signUpLink).toBeInTheDocument()
      expect(signUpLink.closest('a')).toHaveAttribute('href', '/sign-up')
    })

    it('has back to home link', () => {
      render(<SignInPage />)
      
      const homeLink = screen.getByText('← Back to home')
      expect(homeLink).toBeInTheDocument()
      expect(homeLink.closest('a')).toHaveAttribute('href', '/')
    })

    it('has theme toggle', () => {
      render(<SignInPage />)
      
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument()
    })
  })

  describe('Form Interaction', () => {
    it('allows user to type in email field', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      await user.type(emailInput, 'test@example.com')

      expect(emailInput).toHaveValue('test@example.com')
    })

    it('disables form during submission', async () => {
      const user = userEvent.setup()
      mockSignInWithOtp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send magic link' })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
    })
  })

  describe('Magic Link Authentication', () => {
    it('successfully sends magic link', async () => {
      const user = userEvent.setup()
      const testEmail = 'test@example.com'

      mockSignInWithOtp.mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: null 
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send magic link' })

      await user.type(emailInput, testEmail)
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignInWithOtp).toHaveBeenCalledWith({
          email: testEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
      })

      expect(screen.getByText('Please check your email for a magic link to sign in. The link will expire in 1 hour.')).toBeInTheDocument()
    })

    it.skip('handles authentication errors', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid email address'

      mockSignInWithOtp.mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: { message: errorMessage } 
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send magic link' })

      await user.type(emailInput, 'invalid-email')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('prevents submission without email', async () => {
      const user = userEvent.setup()
      render(<SignInPage />)

      const submitButton = screen.getByRole('button', { name: 'Send magic link' })
      await user.click(submitButton)

      expect(mockSignInWithOtp).not.toHaveBeenCalled()
    })

    it('clears previous errors on new submission', async () => {
      const user = userEvent.setup()
      
      // First submission with error
      mockSignInWithOtp.mockResolvedValueOnce({ 
        data: { user: null, session: null }, 
        error: { message: 'Some error' } 
      })
      
      // Second submission successful
      mockSignInWithOtp.mockResolvedValueOnce({ 
        data: { user: null, session: null }, 
        error: null 
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send magic link' })

      // First submission
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Some error')).toBeInTheDocument()
      })

      // Second submission
      await user.clear(emailInput)
      await user.type(emailInput, 'test2@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('Some error')).not.toBeInTheDocument()
      })
    })

    it.skip('clears previous success messages on new submission', async () => {
      const user = userEvent.setup()
      
      mockSignInWithOtp.mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: null 
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send magic link' })

      // First submission
      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Please check your email for a magic link to sign in. The link will expire in 1 hour.')).toBeInTheDocument()
      })

      // Second submission
      await user.type(emailInput, 'test2@example.com')
      await user.click(submitButton)

      // Success message should be cleared momentarily during submission
      expect(screen.queryByText('Please check your email for a magic link to sign in. The link will expire in 1 hour.')).not.toBeInTheDocument()
    })
  })

  describe('User Experience', () => {
    it('shows loading state during magic link sending', async () => {
      const user = userEvent.setup()
      
      mockSignInWithOtp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send magic link' })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      expect(submitButton).toBeDisabled()
    })

    it('displays success message with correct styling', async () => {
      const user = userEvent.setup()
      
      mockSignInWithOtp.mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: null 
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send magic link' })

      await user.type(emailInput, 'test@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        const successMessage = screen.getByText('Please check your email for a magic link to sign in. The link will expire in 1 hour.')
        expect(successMessage).toBeInTheDocument()
        expect(successMessage.closest('div')).toHaveClass('text-green-700', 'dark:text-green-300')
      })
    })

    it.skip('displays error message with correct styling', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid email'
      
      mockSignInWithOtp.mockResolvedValue({ 
        data: { user: null, session: null }, 
        error: { message: errorMessage } 
      })

      render(<SignInPage />)

      const emailInput = screen.getByLabelText('Email address')
      const submitButton = screen.getByRole('button', { name: 'Send magic link' })

      await user.type(emailInput, 'invalid@example.com')
      await user.click(submitButton)

      await waitFor(() => {
        const errorDiv = screen.getByText(errorMessage)
        expect(errorDiv).toBeInTheDocument()
        expect(errorDiv.closest('div')).toHaveClass('text-red-700', 'dark:text-red-300')
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels', () => {
      render(<SignInPage />)
      
      expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    })

    it('has proper button text', () => {
      render(<SignInPage />)
      
      expect(screen.getByRole('button', { name: 'Send magic link' })).toBeInTheDocument()
    })

    it('has proper heading structure', () => {
      render(<SignInPage />)
      
      expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Login to your Nova account' })).toBeInTheDocument()
    })
  })
})