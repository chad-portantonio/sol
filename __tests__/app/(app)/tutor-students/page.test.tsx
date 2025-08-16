import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TutorStudents from '@/app/(app)/tutor-students/page';

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.confirm
global.confirm = jest.fn();

describe('TutorStudents Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (global.confirm as jest.Mock).mockClear();
  });

  it('should render loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<TutorStudents />);
    
    expect(screen.getByText('Loading relationships...')).toBeInTheDocument();
  });

  it('should render relationships successfully', async () => {
    const mockTutorStudents = [
      {
        id: 'ts-1',
        subject: 'Mathematics',
        startDate: '2024-01-01T00:00:00Z',
        active: true,
        notes: 'Excellent progress',
        student: {
          id: 'student-1',
          fullName: 'John Doe',
          subject: 'Math',
          year: 'Grade 10',
          active: true,
        },
      },
      {
        id: 'ts-2',
        subject: 'Physics',
        startDate: '2024-01-15T00:00:00Z',
        endDate: '2024-02-15T00:00:00Z',
        active: false,
        notes: 'Completed course',
        student: {
          id: 'student-2',
          fullName: 'Jane Smith',
          subject: 'Science',
          year: 'Grade 11',
          active: true,
        },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tutorStudents: mockTutorStudents }),
    });

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('Student Relationships')).toBeInTheDocument();
    });

    // Check stats and sections
    expect(screen.getAllByText('Active Relationships')).toHaveLength(2); // Stats + table header
    expect(screen.getAllByText('Ended Relationships')).toHaveLength(2); // Stats + table header
    expect(screen.getByText('Total Relationships')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();

    // Check ended relationships table content
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('should handle empty state', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tutorStudents: [] }),
    });

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('No active relationships')).toBeInTheDocument();
    });

    expect(screen.getByText('Add your first student relationship →')).toBeInTheDocument();
  });

  it('should handle API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch relationships' }),
    });

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch relationships')).toBeInTheDocument();
    });
  });

  it('should handle network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('should end relationship when confirmed', async () => {
    const mockTutorStudents = [
      {
        id: 'ts-1',
        subject: 'Mathematics',
        startDate: '2024-01-01T00:00:00Z',
        active: true,
        notes: 'Excellent progress',
        student: {
          id: 'student-1',
          fullName: 'John Doe',
          subject: 'Math',
          year: 'Grade 10',
          active: true,
        },
      },
    ];

    // Mock initial fetch
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tutorStudents: mockTutorStudents }),
      })
      // Mock DELETE request
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Relationship ended' }),
      })
      // Mock refetch after deletion
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tutorStudents: [] }),
      });

    (global.confirm as jest.Mock).mockReturnValue(true);

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click end button
    const endButton = screen.getByText('End');
    fireEvent.click(endButton);

    // Wait for confirmation and API calls
    await waitFor(() => {
      expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to end this tutoring relationship?');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/tutor-students/ts-1', {
      method: 'DELETE',
    });
  });

  it('should not end relationship when cancelled', async () => {
    const mockTutorStudents = [
      {
        id: 'ts-1',
        subject: 'Mathematics',
        startDate: '2024-01-01T00:00:00Z',
        active: true,
        notes: 'Excellent progress',
        student: {
          id: 'student-1',
          fullName: 'John Doe',
          subject: 'Math',
          year: 'Grade 10',
          active: true,
        },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tutorStudents: mockTutorStudents }),
    });

    (global.confirm as jest.Mock).mockReturnValue(false);

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click end button
    const endButton = screen.getByText('End');
    fireEvent.click(endButton);

    expect(global.confirm).toHaveBeenCalled();
    
    // Should not make DELETE request
    expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial fetch
  });

  it('should display correct navigation links', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tutorStudents: [] }),
    });

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('Student Relationships')).toBeInTheDocument();
    });

    // Check for navigation links
    const addButton = screen.getByText('Add Student Relationship');
    expect(addButton.closest('a')).toHaveAttribute('href', '/tutor-students/new');

    const addFirstLink = screen.getByText('Add your first student relationship →');
    expect(addFirstLink.closest('a')).toHaveAttribute('href', '/tutor-students/new');
  });

  it('should handle end relationship API errors', async () => {
    const mockTutorStudents = [
      {
        id: 'ts-1',
        subject: 'Mathematics',
        startDate: '2024-01-01T00:00:00Z',
        active: true,
        notes: 'Excellent progress',
        student: {
          id: 'student-1',
          fullName: 'John Doe',
          subject: 'Math',
          year: 'Grade 10',
          active: true,
        },
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tutorStudents: mockTutorStudents }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to end relationship' }),
      });

    (global.confirm as jest.Mock).mockReturnValue(true);

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const endButton = screen.getByText('End');
    fireEvent.click(endButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to end relationship')).toBeInTheDocument();
    });
  });

  it('should format dates correctly', async () => {
    const mockTutorStudents = [
      {
        id: 'ts-1',
        subject: 'Mathematics',
        startDate: '2024-01-15T10:30:00Z',
        endDate: '2024-02-15T15:45:00Z',
        active: false,
        notes: 'Completed',
        student: {
          id: 'student-1',
          fullName: 'John Doe',
          subject: 'Math',
          year: 'Grade 10',
          active: true,
        },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tutorStudents: mockTutorStudents }),
    });

    render(<TutorStudents />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Check that dates are formatted (exact format depends on locale)
    expect(screen.getByText(/1\/15\/2024/)).toBeInTheDocument();
    expect(screen.getByText(/2\/15\/2024/)).toBeInTheDocument();
  });
});
