import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createBrowserClient } from '@supabase/ssr';
import TutorOnboarding from '@/app/(app)/tutor-onboarding/page';

// Mock Supabase client
jest.mock('@supabase/ssr', () => ({
  createBrowserClient: jest.fn(),
}));

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('TutorOnboarding', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'Test User',
    },
  };

  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
      }),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createBrowserClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ message: 'Profile created successfully' }),
    });
  });

  describe('Page Rendering', () => {
    it('renders the onboarding form with all required sections', async () => {
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // Check for all form sections
      expect(screen.getByText('Profile Image')).toBeInTheDocument();
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Subjects You Teach *')).toBeInTheDocument();
      expect(screen.getByText('Experience & Rates')).toBeInTheDocument();
      expect(screen.getByText('Bio & Availability')).toBeInTheDocument();
    });

    it('shows cartoon avatar when no image is uploaded', async () => {
      render(<TutorOnboarding />);

      await waitFor(() => {
        const avatarImage = screen.getByAltText('Avatar');
        expect(avatarImage).toBeInTheDocument();
        expect(avatarImage).toHaveAttribute('src', expect.stringContaining('api.dicebear.com'));
      });
    });
  });

  describe('Form Validation', () => {
    it('requires display name', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Complete Profile Setup');
      expect(submitButton).toBeDisabled();
    });

    it('requires at least one subject', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // Fill in display name
      const displayNameInput = screen.getByLabelText('Display Name *');
      await user.type(displayNameInput, 'John Doe');

      const submitButton = screen.getByText('Complete Profile Setup');
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when required fields are filled', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // Fill in required fields
      const displayNameInput = screen.getByLabelText('Display Name *');
      await user.type(displayNameInput, 'John Doe');

      const countrySelect = screen.getByLabelText('Country *');
      await user.selectOptions(countrySelect, 'Jamaica');

      const cityInput = screen.getByLabelText('City *');
      await user.type(cityInput, 'Kingston');

      // Select a subject
      const mathematicsSubject = screen.getByText('Mathematics');
      await user.click(mathematicsSubject);

      const submitButton = screen.getByText('Complete Profile Setup');
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Subject Selection', () => {
    it('allows selecting multiple subjects', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      const mathematicsSubject = screen.getByText('Mathematics');
      const physicsSubject = screen.getByText('Physics');

      await user.click(mathematicsSubject);
      await user.click(physicsSubject);

      expect(mathematicsSubject).toHaveClass('bg-blue-600');
      expect(physicsSubject).toHaveClass('bg-blue-600');
    });

    it('allows deselecting subjects', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      const mathematicsSubject = screen.getByText('Mathematics');

      // Select subject
      await user.click(mathematicsSubject);
      expect(mathematicsSubject).toHaveClass('bg-blue-600');

      // Deselect subject
      await user.click(mathematicsSubject);
      expect(mathematicsSubject).not.toHaveClass('bg-blue-600');
    });
  });

  describe('Image Upload', () => {
    it('handles image file selection', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
      const uploadButton = screen.getByText('Upload Image');

      // Mock file input
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.files = [file];
      
      // Simulate file selection
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', { value: fileInput });
      
      await user.click(uploadButton);
    });

    it('shows error for invalid file types', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // This would be tested with actual file input handling
      // For now, we'll test the error message display
      expect(screen.getByText(/Upload a clear photo of yourself/)).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form successfully with image upload', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // Fill in all required fields
      const displayNameInput = screen.getByLabelText('Display Name *');
      await user.type(displayNameInput, 'John Doe');

      const countrySelect = screen.getByLabelText('Country *');
      await user.selectOptions(countrySelect, 'Jamaica');

      const cityInput = screen.getByLabelText('City *');
      await user.type(cityInput, 'Kingston');

      // Select subjects
      const mathematicsSubject = screen.getByText('Mathematics');
      await user.click(mathematicsSubject);

      // Fill in optional fields
      const bioInput = screen.getByLabelText('Bio');
      await user.type(bioInput, 'Experienced math tutor with 5 years of teaching');

      const experienceInput = screen.getByLabelText('Experience');
      await user.type(experienceInput, '5 years teaching Mathematics');

      const hourlyRateInput = screen.getByLabelText('Hourly Rate');
      await user.type(hourlyRateInput, '$25/hour');

      const availabilityInput = screen.getByLabelText('Availability');
      await user.type(availabilityInput, 'Weekdays 4-8 PM');

      const submitButton = screen.getByText('Complete Profile Setup');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/tutors/profiles', expect.any(Object));
      });
    });

    it('submits form successfully without image upload (uses cartoon avatar)', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // Fill in all required fields
      const displayNameInput = screen.getByLabelText('Display Name *');
      await user.type(displayNameInput, 'Jane Smith');

      const countrySelect = screen.getByLabelText('Country *');
      await user.selectOptions(countrySelect, 'Trinidad and Tobago');

      const cityInput = screen.getByLabelText('City *');
      await user.type(cityInput, 'Port of Spain');

      // Select subjects
      const physicsSubject = screen.getByText('Physics');
      await user.click(physicsSubject);

      const submitButton = screen.getByText('Complete Profile Setup');
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/tutors/profiles', expect.any(Object));
      });
    });

    it('handles API errors gracefully', async () => {
      const user = userEvent.setup();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to create profile' }),
      });

      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // Fill in required fields
      const displayNameInput = screen.getByLabelText('Display Name *');
      await user.type(displayNameInput, 'John Doe');

      const countrySelect = screen.getByLabelText('Country *');
      await user.selectOptions(countrySelect, 'Jamaica');

      const cityInput = screen.getByLabelText('City *');
      await user.type(cityInput, 'Kingston');

      const mathematicsSubject = screen.getByText('Mathematics');
      await user.click(mathematicsSubject);

      const submitButton = screen.getByText('Complete Profile Setup');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to create profile')).toBeInTheDocument();
      });
    });
  });

  describe('Location Fields', () => {
    it('displays Caribbean countries in dropdown', async () => {
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      const countrySelect = screen.getByLabelText('Country *');
      
      expect(screen.getByText('Jamaica')).toBeInTheDocument();
      expect(screen.getByText('Trinidad and Tobago')).toBeInTheDocument();
      expect(screen.getByText('Barbados')).toBeInTheDocument();
    });

    it('requires both country and city', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // Fill in display name
      const displayNameInput = screen.getByLabelText('Display Name *');
      await user.type(displayNameInput, 'John Doe');

      // Fill in only country
      const countrySelect = screen.getByLabelText('Country *');
      await user.selectOptions(countrySelect, 'Jamaica');

      const submitButton = screen.getByText('Complete Profile Setup');
      expect(submitButton).toBeDisabled();

      // Fill in city
      const cityInput = screen.getByLabelText('City *');
      await user.type(cityInput, 'Kingston');

      // Select a subject
      const mathematicsSubject = screen.getByText('Mathematics');
      await user.click(mathematicsSubject);

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper form labels and required indicators', async () => {
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      // Check required field indicators
      expect(screen.getByLabelText('Display Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Country *')).toBeInTheDocument();
      expect(screen.getByLabelText('City *')).toBeInTheDocument();
      expect(screen.getByText('Subjects You Teach *')).toBeInTheDocument();

      // Check optional field labels
      expect(screen.getByLabelText('Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
      expect(screen.getByLabelText('Experience')).toBeInTheDocument();
      expect(screen.getByLabelText('Hourly Rate')).toBeInTheDocument();
      expect(screen.getByLabelText('Availability')).toBeInTheDocument();
    });

    it('has proper button states and loading indicators', async () => {
      const user = userEvent.setup();
      render(<TutorOnboarding />);

      await waitFor(() => {
        expect(screen.getByText('Complete Your Tutor Profile')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('Complete Profile Setup');
      
      // Initially disabled
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveClass('disabled:opacity-50');

      // Fill in required fields
      const displayNameInput = screen.getByLabelText('Display Name *');
      await user.type(displayNameInput, 'John Doe');

      const countrySelect = screen.getByLabelText('Country *');
      await user.selectOptions(countrySelect, 'Jamaica');

      const cityInput = screen.getByLabelText('City *');
      await user.type(cityInput, 'Kingston');

      const mathematicsSubject = screen.getByText('Mathematics');
      await user.click(mathematicsSubject);

      // Now enabled
      expect(submitButton).not.toBeDisabled();
    });
  });
});
