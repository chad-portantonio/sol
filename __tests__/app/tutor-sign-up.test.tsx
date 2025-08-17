import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createBrowserClient } from '@supabase/ssr';
import TutorSignUp from '@/app/(auth)/tutor-sign-up/page';

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

describe('TutorSignUp', () => {
  const mockSupabaseClient = {
    auth: {
      signInWithOtp: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('Page Rendering', () => {
    it('renders the tutor sign-up form', () => {
      render(<TutorSignUp />);

      expect(screen.getByText('Become a Tutor')).toBeInTheDocument();
      expect(screen.getByText('Share your knowledge with students')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
      expect(screen.getByText('Start Teaching Journey')).toBeInTheDocument();
    });

    it('shows the sign-in link', () => {
      render(<TutorSignUp />);

      const signInLink = screen.getByText('Sign in');
      expect(signInLink).toBeInTheDocument();
      expect(signInLink.closest('a')).toHaveAttribute('href', '/sign-in');
    });

    it('displays the back to home link', () => {
      render(<TutorSignUp />);

      const backLink = screen.getByText('← Back to home');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('Form Validation', () => {
    it('requires email address', async () => {
      const user = userEvent.setup();
      render(<TutorSignUp />);

      const submitButton = screen.getByText('Start Teaching Journey');
      expect(submitButton).toBeInTheDocument();

      // Try to submit without email
      await user.click(submitButton);

      // Email field should be required
      const emailInput = screen.getByLabelText('Email address');
      expect(emailInput).toHaveAttribute('required');
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      // Enter invalid email
      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      // The form should still submit (HTML5 validation will handle format)
      expect(emailInput).toHaveAttribute('type', 'email');
    });
  });

  describe('Sign-up Flow', () => {
    it('sends magic link successfully', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
          email: 'test@example.com',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
            data: {
              role: 'tutor',
              full_name: 'test',
            },
          },
        });
      });

      // Should show success message
      expect(screen.getByText(/We sent you a magic link/)).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('handles sign-up errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Email already registered';
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: { message: errorMessage },
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'existing@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('sets loading state during submission', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ error: null }), 100))
      );

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Button should show loading state
      expect(screen.getByText('Sending magic link...')).toBeInTheDocument();
      expect(screen.getByText('Sending magic link...')).toBeDisabled();
    });
  });

  describe('Success State', () => {
    it('shows success message after magic link sent', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/We sent you a magic link/)).toBeInTheDocument();
        expect(screen.getByText(/Please check your email/)).toBeInTheDocument();
        expect(screen.getByText(/The link expires in 1 hour/)).toBeInTheDocument();
      });
    });

    it('shows resend and change email options', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Resend email')).toBeInTheDocument();
        expect(screen.getByText('Use a different email')).toBeInTheDocument();
      });
    });

    it('allows resending magic link', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Resend email')).toBeInTheDocument();
      });

      const resendButton = screen.getByText('Resend email');
      await user.click(resendButton);

      expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledTimes(2);
    });

    it('allows changing email address', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Use a different email')).toBeInTheDocument();
      });

      const changeEmailButton = screen.getByText('Use a different email');
      await user.click(changeEmailButton);

      // Should return to form state
      expect(screen.getByText('Start Teaching Journey')).toBeInTheDocument();
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    });
  });

  describe('User Metadata', () => {
    it('sends tutor role in user metadata', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'john.doe@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
          email: 'john.doe@example.com',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
            data: {
              role: 'tutor',
              full_name: 'john.doe',
            },
          },
        });
      });
    });

    it('extracts display name from email', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'jane.smith@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOtp).toHaveBeenCalledWith({
          email: 'jane.smith@example.com',
          options: {
            emailRedirectTo: expect.stringContaining('/auth/callback'),
            data: {
              role: 'tutor',
              full_name: 'jane.smith',
            },
          },
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and placeholders', () => {
      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
    });

    it('has proper button states', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: null,
      });

      render(<TutorSignUp />);

      const submitButton = screen.getByText('Start Teaching Journey');
      expect(submitButton).toHaveAttribute('type', 'submit');

      // Fill form and submit
      const emailInput = screen.getByLabelText('Email address');
      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      // Button should be disabled during loading
      await waitFor(() => {
        expect(screen.getByText('Sending magic link...')).toBeDisabled();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays network errors', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'test@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
      });
    });

    it('clears error when changing email', async () => {
      const user = userEvent.setup();
      (mockSupabaseClient.auth.signInWithOtp as jest.Mock).mockResolvedValue({
        error: { message: 'Email already registered' },
      });

      render(<TutorSignUp />);

      const emailInput = screen.getByLabelText('Email address');
      const submitButton = screen.getByText('Start Teaching Journey');

      await user.type(emailInput, 'existing@example.com');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
      });

      // Clear email and type new one
      await user.clear(emailInput);
      await user.type(emailInput, 'new@example.com');

      // Error should be cleared
      expect(screen.queryByText('Email already registered')).not.toBeInTheDocument();
    });
  });
});
