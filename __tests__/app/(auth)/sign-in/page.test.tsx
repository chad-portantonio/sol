import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SignInPage from '@/app/(auth)/sign-in/page'

// Mock the createBrowserClient
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
    },
  })),
}))

describe('SignInPage', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('renders sign in form', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument()
    expect(screen.getByLabelText('Email address')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('displays Nova branding', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Nova')).toBeInTheDocument()
  })

  it('has link to sign up page', () => {
    render(<SignInPage />)
    
    const signUpLink = screen.getByText('create a new account')
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/sign-up')
  })

  it('has link back to home', () => {
    render(<SignInPage />)
    
    const homeLink = screen.getByText('← Back to home')
    expect(homeLink).toBeInTheDocument()
    expect(homeLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('shows form validation for required fields', async () => {
    render(<SignInPage />)
    
    const submitButton = screen.getByRole('button', { name: 'Sign in' })
    fireEvent.click(submitButton)
    
    // Check that HTML5 validation prevents submission
    await waitFor(() => {
      expect(screen.getByLabelText('Email address')).toBeInvalid()
      expect(screen.getByLabelText('Password')).toBeInvalid()
    })
  })

  it('handles form input changes', async () => {
    const user = userEvent.setup()
    render(<SignInPage />)
    
    const emailInput = screen.getByLabelText('Email address')
    const passwordInput = screen.getByLabelText('Password')
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    expect(emailInput).toHaveValue('test@example.com')
    expect(passwordInput).toHaveValue('password123')
  })
})

