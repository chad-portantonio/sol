import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewStudent from '@/app/(app)/students/new/page';
import { Student } from '@/lib/types';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock fetch globally
global.fetch = jest.fn();

describe('NewStudent Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should render the form with all required fields', () => {
    render(<NewStudent />);

    // Check for title and description
    expect(screen.getByText('Add New Student')).toBeInTheDocument();
    expect(screen.getByText('Add a new student to your tutoring roster. You can have up to 20 active students.')).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByLabelText(/Full Name/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subject/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Year\/Level/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Parent Email/)).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Create Student')).toBeInTheDocument();

    // Check for back link
    expect(screen.getByText('← Back to Dashboard')).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    render(<NewStudent />);

    const fullNameInput = screen.getByLabelText(/Full Name/) as HTMLInputElement;
    const subjectInput = screen.getByLabelText(/Subject/) as HTMLInputElement;
    const yearInput = screen.getByLabelText(/Year\/Level/) as HTMLInputElement;
    const parentEmailInput = screen.getByLabelText(/Parent Email/) as HTMLInputElement;

    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(subjectInput, { target: { value: 'Mathematics' } });
    fireEvent.change(yearInput, { target: { value: 'Grade 10' } });
    fireEvent.change(parentEmailInput, { target: { value: 'parent@example.com' } });

    expect(fullNameInput.value).toBe('John Doe');
    expect(subjectInput.value).toBe('Mathematics');
    expect(yearInput.value).toBe('Grade 10');
    expect(parentEmailInput.value).toBe('parent@example.com');
  });

  it('should submit form with valid data successfully', async () => {
    const mockStudent: Student = {
      id: 'student-123',
      fullName: 'John Doe',
      subject: 'Mathematics',
      year: 'Grade 10',
      active: true,
      parentEmail: 'parent@example.com',
      parentLinkToken: 'token-123',
      tutorId: 'tutor-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      sessions: []
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ student: mockStudent }),
    });

    render(<NewStudent />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Mathematics' } });
    fireEvent.change(screen.getByLabelText(/Year\/Level/), { target: { value: 'Grade 10' } });
    fireEvent.change(screen.getByLabelText(/Parent Email/), { target: { value: 'parent@example.com' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Student'));

    // Wait for the API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'John Doe',
          subject: 'Mathematics',
          year: 'Grade 10',
          parentEmail: 'parent@example.com',
        }),
      });
    });

    // Check for success state
    await waitFor(() => {
      expect(screen.getByText('Student Created Successfully!')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('has been added to your student list.')).toBeInTheDocument();
    });
  });

  it('should show loading state during form submission', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<NewStudent />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Mathematics' } });
    fireEvent.change(screen.getByLabelText(/Year\/Level/), { target: { value: 'Grade 10' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Student'));

    // Check for loading state
    expect(screen.getByText('Creating...')).toBeInTheDocument();
    expect(screen.getByText('Creating...')).toBeDisabled();
  });

  it('should handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Cannot exceed 20 active students' }),
    });

    render(<NewStudent />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Mathematics' } });
    fireEvent.change(screen.getByLabelText(/Year\/Level/), { target: { value: 'Grade 10' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Student'));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Cannot exceed 20 active students')).toBeInTheDocument();
    });

    // Form should still be visible (not in success state)
    expect(screen.getByText('Add New Student')).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<NewStudent />);

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Mathematics' } });
    fireEvent.change(screen.getByLabelText(/Year\/Level/), { target: { value: 'Grade 10' } });

    // Submit the form
    fireEvent.click(screen.getByText('Create Student'));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should validate required fields', () => {
    render(<NewStudent />);

    const fullNameInput = screen.getByLabelText(/Full Name/);
    const subjectInput = screen.getByLabelText(/Subject/);
    const yearInput = screen.getByLabelText(/Year\/Level/);

    // Check that required fields have the required attribute
    expect(fullNameInput).toBeRequired();
    expect(subjectInput).toBeRequired();
    expect(yearInput).toBeRequired();

    // Parent email should not be required
    const parentEmailInput = screen.getByLabelText(/Parent Email/);
    expect(parentEmailInput).not.toBeRequired();
  });

  it('should show success screen with parent link', async () => {
    const mockStudent: Student = {
      id: 'student-123',
      fullName: 'John Doe',
      subject: 'Mathematics',
      year: 'Grade 10',
      active: true,
      parentEmail: 'parent@example.com',
      parentLinkToken: 'token-123',
      tutorId: 'tutor-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      sessions: []
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ student: mockStudent }),
    });

    // Mock window.location.origin
    delete (window as any).location;
    window.location = { origin: 'http://localhost:3000' } as any;

    render(<NewStudent />);

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Mathematics' } });
    fireEvent.change(screen.getByLabelText(/Year\/Level/), { target: { value: 'Grade 10' } });
    fireEvent.click(screen.getByText('Create Student'));

    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByText('Student Created Successfully!')).toBeInTheDocument();
    });

    // Check for parent link
    const parentLinkInput = screen.getByDisplayValue('http://localhost:3000/parent/token-123');
    expect(parentLinkInput).toBeInTheDocument();

    // Check for action buttons
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Add Another Student')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('should reset form when clicking "Add Another Student"', async () => {
    const mockStudent: Student = {
      id: 'student-123',
      fullName: 'John Doe',
      subject: 'Mathematics',
      year: 'Grade 10',
      active: true,
      parentEmail: 'parent@example.com',
      parentLinkToken: 'token-123',
      tutorId: 'tutor-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      sessions: []
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ student: mockStudent }),
    });

    render(<NewStudent />);

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Mathematics' } });
    fireEvent.change(screen.getByLabelText(/Year\/Level/), { target: { value: 'Grade 10' } });
    fireEvent.click(screen.getByText('Create Student'));

    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByText('Student Created Successfully!')).toBeInTheDocument();
    });

    // Click "Add Another Student"
    fireEvent.click(screen.getByText('Add Another Student'));

    // Should return to form view
    expect(screen.getByText('Add New Student')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name *')).toHaveValue(''); // Form inputs should be cleared
  });

  it('should copy parent link to clipboard', async () => {
    const mockStudent: Student = {
      id: 'student-123',
      fullName: 'John Doe',
      subject: 'Mathematics',
      year: 'Grade 10',
      active: true,
      parentEmail: 'parent@example.com',
      parentLinkToken: 'token-123',
      tutorId: 'tutor-123',
      createdAt: new Date(),
      updatedAt: new Date(),
      sessions: []
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ student: mockStudent }),
    });

    // Mock clipboard API
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    // Mock window.alert
    window.alert = jest.fn();

    delete (window as any).location;
    window.location = { origin: 'http://localhost:3000' } as any;

    render(<NewStudent />);

    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/Full Name/), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Subject/), { target: { value: 'Mathematics' } });
    fireEvent.change(screen.getByLabelText(/Year\/Level/), { target: { value: 'Grade 10' } });
    fireEvent.click(screen.getByText('Create Student'));

    // Wait for success screen
    await waitFor(() => {
      expect(screen.getByText('Student Created Successfully!')).toBeInTheDocument();
    });

    // Click copy button
    fireEvent.click(screen.getByText('Copy'));

    // Wait for clipboard action
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('http://localhost:3000/parent/token-123');
      expect(window.alert).toHaveBeenCalledWith('Parent link copied to clipboard!');
    });
  });
});
