import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '@/app/(app)/dashboard/page';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('@/lib/auth', () => ({
  requireUser: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRequireUser = requireUser as jest.MockedFunction<typeof requireUser>;

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard with tutor data and students', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };
    const mockTutor = {
      id: 'tutor123',
      userId: 'user123',
      email: 'tutor@example.com',
      students: [
        {
          id: 'student1',
          fullName: 'John Doe',
          subject: 'Math',
          year: '10th Grade',
          active: true,
          parentEmail: 'parent@example.com',
          sessions: [
            {
              id: 'session1',
              startTime: new Date('2024-01-15T10:00:00Z'),
              endTime: new Date('2024-01-15T11:00:00Z'),
            },
          ],
        },
        {
          id: 'student2',
          fullName: 'Jane Smith',
          subject: 'Science',
          year: '11th Grade',
          active: false,
          parentEmail: null,
          sessions: [],
        },
      ],
    };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

    const dashboard = await Dashboard();
    render(dashboard);

    // Check that the dashboard title is rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Manage your students and sessions')).toBeInTheDocument();

    // Check that stats are displayed correctly
    expect(screen.getByText('1')).toBeInTheDocument(); // Active students
    expect(screen.getByText('2')).toBeInTheDocument(); // Total students
    expect(screen.getByText('19')).toBeInTheDocument(); // Available slots (20 - 1 active)

    // Check that student names are displayed
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check that student details are displayed
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Science')).toBeInTheDocument();
    expect(screen.getByText('10th Grade')).toBeInTheDocument();
    expect(screen.getByText('11th Grade')).toBeInTheDocument();

    // Check that next session is displayed for active student (using a more flexible approach)
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();

    // Check that status badges are displayed
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();

    // Check that "Add New Student" button is present
    expect(screen.getByText('Add New Student')).toBeInTheDocument();
  });

  it('should render empty state when no students exist', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };
    const mockTutor = {
      id: 'tutor123',
      userId: 'user123',
      email: 'tutor@example.com',
      students: [],
    };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

    const dashboard = await Dashboard();
    render(dashboard);

    expect(screen.getByText('No students yet')).toBeInTheDocument();
    expect(screen.getByText('Add your first student →')).toBeInTheDocument();
  });

  it('should create tutor profile if one does not exist', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };
    const mockTutor = {
      id: 'tutor123',
      userId: 'user123',
      email: 'tutor@example.com',
      students: [],
    };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.tutor.create as jest.Mock).mockResolvedValue(mockTutor);

    const dashboard = await Dashboard();
    render(dashboard);

    // Should create the tutor profile
    expect(mockPrisma.tutor.create).toHaveBeenCalledWith({
      data: {
        userId: 'user123',
        email: 'tutor@example.com',
      },
    });
  });

  it('should handle tutor profile creation failure gracefully', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.tutor.create as jest.Mock).mockRejectedValue(new Error('Database error'));

    const dashboard = await Dashboard();
    render(dashboard);

    expect(screen.getByText('Setup Required')).toBeInTheDocument();
    expect(screen.getByText('There was an issue setting up your account. Please try signing out and back in.')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('should handle authentication errors gracefully', async () => {
    mockRequireUser.mockRejectedValue(new Error('Auth error'));

    const dashboard = await Dashboard();
    render(dashboard);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('There was an error loading your dashboard. Please try refreshing the page.')).toBeInTheDocument();
  });

  it('should display correct student counts and statuses', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };
    const mockTutor = {
      id: 'tutor123',
      userId: 'user123',
      email: 'tutor@example.com',
      students: [
        { id: '1', fullName: 'Student 1', subject: 'Math', year: '10th', active: true, parentEmail: null, sessions: [] },
        { id: '2', fullName: 'Student 2', subject: 'Science', year: '11th', active: true, parentEmail: null, sessions: [] },
        { id: '3', fullName: 'Student 3', subject: 'English', year: '12th', active: false, parentEmail: null, sessions: [] },
      ],
    };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

    const dashboard = await Dashboard();
    render(dashboard);

    // Check stats
    expect(screen.getByText('2')).toBeInTheDocument(); // Active students
    expect(screen.getByText('3')).toBeInTheDocument(); // Total students
    expect(screen.getByText('18')).toBeInTheDocument(); // Available slots (20 - 2 active)

    // Check student names
    expect(screen.getByText('Student 1')).toBeInTheDocument();
    expect(screen.getByText('Student 2')).toBeInTheDocument();
    expect(screen.getByText('Student 3')).toBeInTheDocument();
  });

  describe('Session Display', () => {
    it('should show upcoming sessions correctly', async () => {
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'John Doe',
            subject: 'Math',
            year: '10th Grade',
            active: true,
            parentEmail: 'parent@example.com',
            sessions: [
              {
                id: 'session1',
                startTime: futureDate,
                endTime: new Date(futureDate.getTime() + 3600000), // 1 hour later
              },
            ],
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      // Should display the formatted date for the upcoming session
      const sessionDate = screen.getByText(/\w{3} \d{1,2}, \d{4}/);
      expect(sessionDate).toBeInTheDocument();
    });

    it('should show "No upcoming sessions" when no future sessions exist', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'John Doe',
            subject: 'Math',
            year: '10th Grade',
            active: true,
            parentEmail: null,
            sessions: [], // No sessions
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      expect(screen.getByText('No upcoming sessions')).toBeInTheDocument();
    });
  });

  describe('Student Table Features', () => {
    it('should display parent email when available', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'John Doe',
            subject: 'Math',
            year: '10th Grade',
            active: true,
            parentEmail: 'parent@example.com',
            sessions: [],
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('parent@example.com')).toBeInTheDocument();
    });

    it('should not display parent email section when not available', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'Jane Smith',
            subject: 'Science',
            year: '11th Grade',
            active: true,
            parentEmail: null,
            sessions: [],
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('@')).not.toBeInTheDocument(); // No email should be displayed
    });

    it('should have clickable View links for each student', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'John Doe',
            subject: 'Math',
            year: '10th Grade',
            active: true,
            parentEmail: null,
            sessions: [],
          },
          {
            id: 'student2',
            fullName: 'Jane Smith',
            subject: 'Science',
            year: '11th Grade',
            active: false,
            parentEmail: null,
            sessions: [],
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      const viewLinks = screen.getAllByText('View');
      expect(viewLinks).toHaveLength(2);
      
      // Check that links have correct href attributes
      expect(viewLinks[0]).toHaveAttribute('href', '/students/student1');
      expect(viewLinks[1]).toHaveAttribute('href', '/students/student2');
    });
  });

  describe('Navigation and Actions', () => {
    it('should have working "Add New Student" buttons', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      const addStudentButtons = screen.getAllByText(/Add.*[Ss]tudent/);
      expect(addStudentButtons.length).toBeGreaterThan(0);
      
      // Check that buttons link to the correct page
      addStudentButtons.forEach(button => {
        expect(button).toHaveAttribute('href', '/students/new');
      });
    });

    it('should display table headers correctly', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'Test Student',
            subject: 'Math',
            year: '10th Grade',
            active: true,
            parentEmail: null,
            sessions: [],
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      // Check all table headers
      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.getByText('Subject')).toBeInTheDocument();
      expect(screen.getByText('Year')).toBeInTheDocument();
      expect(screen.getByText('Next Session')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
  });

  describe('Edge Cases and Data Handling', () => {
    it('should handle large number of students correctly', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const students = Array.from({ length: 25 }, (_, i) => ({
        id: `student${i + 1}`,
        fullName: `Student ${i + 1}`,
        subject: 'Math',
        year: '10th Grade',
        active: i < 20, // First 20 are active
        parentEmail: null,
        sessions: [],
      }));

      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students,
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      // Check stats with edge case (0 slots available since we have 20 active students)
      expect(screen.getByText('20')).toBeInTheDocument(); // Active students
      expect(screen.getByText('25')).toBeInTheDocument(); // Total students
      expect(screen.getByText('0')).toBeInTheDocument(); // Available slots (20 - 20 active = 0)
    });

    it('should handle students with special characters in names', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: "O'Connor, María José",
            subject: 'Español',
            year: '12º Grado',
            active: true,
            parentEmail: 'maría.parent@example.com',
            sessions: [],
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      expect(screen.getByText("O'Connor, María José")).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('12º Grado')).toBeInTheDocument();
      expect(screen.getByText('maría.parent@example.com')).toBeInTheDocument();
    });

    it('should handle mixed session states correctly', async () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow
      
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'Student With Future Session',
            subject: 'Math',
            year: '10th Grade',
            active: true,
            parentEmail: null,
            sessions: [
              {
                id: 'future-session',
                startTime: futureDate,
                endTime: new Date(futureDate.getTime() + 3600000),
              },
            ],
          },
          {
            id: 'student2',
            fullName: 'Student With Past Session Only',
            subject: 'Science',
            year: '11th Grade',
            active: true,
            parentEmail: null,
            sessions: [], // Empty because past sessions are filtered out by the query
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      // Student with future session should show the session
      expect(screen.getByText('Student With Future Session')).toBeInTheDocument();
      
      // Student with only past sessions should show "No upcoming sessions"
      expect(screen.getByText('Student With Past Session Only')).toBeInTheDocument();
      expect(screen.getByText('No upcoming sessions')).toBeInTheDocument();
    });
  });

  describe('Accessibility and User Experience', () => {
    it('should have proper ARIA labels and semantic structure', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'Test Student',
            subject: 'Math',
            year: '10th Grade',
            active: true,
            parentEmail: null,
            sessions: [],
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      // Check for proper heading structure
      const mainHeading = screen.getByRole('heading', { level: 1 });
      expect(mainHeading).toHaveTextContent('Dashboard');

      const subHeading = screen.getByRole('heading', { level: 2 });
      expect(subHeading).toHaveTextContent('Students');

      // Check for table structure
      const table = screen.getByRole('table');
      expect(table).toBeInTheDocument();

      // Check for table headers
      const columnHeaders = screen.getAllByRole('columnheader');
      expect(columnHeaders).toHaveLength(6); // Student, Subject, Year, Next Session, Status, Actions
    });

    it('should have keyboard-accessible navigation elements', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [
          {
            id: 'student1',
            fullName: 'Test Student',
            subject: 'Math',
            year: '10th Grade',
            active: true,
            parentEmail: null,
            sessions: [],
          },
        ],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      // Check that all interactive elements are focusable
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
      links.forEach(link => {
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });

      // The dashboard should have proper navigation links
      expect(screen.getByRole('link', { name: 'Add New Student' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'View' })).toBeInTheDocument();
    });
  });

  describe('Performance and Data Loading', () => {
    it('should handle database query correctly', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'tutor@example.com',
        students: [],
      };

      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

      const dashboard = await Dashboard();
      render(dashboard);

      // Verify the Prisma query was called with correct parameters
      expect(mockPrisma.tutor.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        include: {
          students: {
            include: {
              sessions: {
                where: {
                  startTime: {
                    gte: expect.any(Date),
                  },
                },
                orderBy: { startTime: 'asc' },
                take: 1,
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });

    it('should handle auth requirement correctly', async () => {
      const mockUser = { userId: 'user123', email: 'tutor@example.com' };
      mockRequireUser.mockResolvedValue(mockUser);
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.tutor.create as jest.Mock).mockResolvedValue({});

      await Dashboard();

      // Verify requireUser was called
      expect(mockRequireUser).toHaveBeenCalled();
    });
  });
});
