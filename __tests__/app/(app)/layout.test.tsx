import { render, screen } from '@testing-library/react';
import AppLayout from '@/app/(app)/layout';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Mock the dependencies
jest.mock('@/lib/auth', () => ({
  requireUser: jest.fn(),
}));

jest.mock('@/lib/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

const mockRequireUser = requireUser as jest.MockedFunction<typeof requireUser>;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('AppLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render navigation with all expected links', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };
    const mockTutor = {
      id: 'tutor123',
      userId: 'user123',
      email: 'tutor@example.com',
      subscription: { status: 'active' },
    };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

    const layout = await AppLayout({ children: <div>Test Content</div> });
    render(layout);

    // Check for Nova brand
    expect(screen.getByText('Nova')).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('New Student')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();

    // Check that children content is rendered
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should create tutor profile if it does not exist', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.tutor.create as jest.Mock).mockResolvedValue({
      id: 'tutor123',
      userId: 'user123',
      email: 'tutor@example.com',
    });

    const layout = await AppLayout({ children: <div>Test Content</div> });
    render(layout);

    // Should attempt to create tutor profile
    expect(mockPrisma.tutor.create).toHaveBeenCalledWith({
      data: {
        userId: 'user123',
        email: 'tutor@example.com',
      },
    });

    // Content should still render
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should handle tutor creation failure gracefully', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };
    const { redirect } = require('next/navigation');

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.tutor.create as jest.Mock).mockRejectedValue(new Error('Database error'));

    await AppLayout({ children: <div>Test Content</div> });

    // Should redirect to sign-up on failure
    expect(redirect).toHaveBeenCalledWith('/sign-up');
  });

  it('should handle authentication errors by redirecting to sign-in', async () => {
    const { redirect } = require('next/navigation');
    mockRequireUser.mockRejectedValue(new Error('Auth error'));

    await AppLayout({ children: <div>Test Content</div> });

    // Should redirect to sign-in on auth error
    expect(redirect).toHaveBeenCalledWith('/sign-in');
  });

  it('should render with correct navigation structure', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };
    const mockTutor = {
      id: 'tutor123',
      userId: 'user123',
      email: 'tutor@example.com',
      subscription: null,
    };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

    const layout = await AppLayout({ children: <div>Test Content</div> });
    render(layout);

    // Check the layout structure
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');

    // Check main content container
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('max-w-7xl', 'mx-auto', 'py-6', 'sm:px-6', 'lg:px-8');
  });

  it('should render sign out form with correct action', async () => {
    const mockUser = { userId: 'user123', email: 'tutor@example.com' };
    const mockTutor = {
      id: 'tutor123',
      userId: 'user123',
      email: 'tutor@example.com',
      subscription: { status: 'active' },
    };

    mockRequireUser.mockResolvedValue(mockUser);
    (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(mockTutor);

    const layout = await AppLayout({ children: <div>Test Content</div> });
    render(layout);

    // Check for sign out form
    const signOutForm = screen.getByText('Sign Out').closest('form');
    expect(signOutForm).toBeInTheDocument();
    expect(signOutForm).toHaveAttribute('action', '/api/auth/signout');
    expect(signOutForm).toHaveAttribute('method', 'post');
  });
});
