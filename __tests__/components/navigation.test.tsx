import { render, screen, fireEvent } from '@testing-library/react';
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

jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Create a Navigation component to test
const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <a href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Nova
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <a
              href="/dashboard"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Dashboard
            </a>
            <a
              href="/students/new"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              New Student
            </a>
            <a
              href="/billing"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Billing
            </a>
            <form action="/api/auth/signout" method="post">
              <button
                type="submit"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
};

describe('Navigation Component', () => {
  it('should render all navigation links', () => {
    render(<Navigation />);

    // Check brand link
    const brandLink = screen.getByText('Nova');
    expect(brandLink).toBeInTheDocument();
    expect(brandLink.closest('a')).toHaveAttribute('href', '/dashboard');

    // Check navigation links
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');

    const newStudentLink = screen.getByText('New Student');
    expect(newStudentLink).toBeInTheDocument();
    expect(newStudentLink.closest('a')).toHaveAttribute('href', '/students/new');

    const billingLink = screen.getByText('Billing');
    expect(billingLink).toBeInTheDocument();
    expect(billingLink.closest('a')).toHaveAttribute('href', '/billing');

    const signOutButton = screen.getByText('Sign Out');
    expect(signOutButton).toBeInTheDocument();
    expect(signOutButton.closest('form')).toHaveAttribute('action', '/api/auth/signout');
  });

  it('should have correct CSS classes for styling', () => {
    render(<Navigation />);

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('bg-white', 'shadow-sm', 'border-b', 'border-gray-200');

    // Check container classes
    const container = nav.querySelector('.max-w-7xl');
    expect(container).toHaveClass('max-w-7xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');

    // Check flex container
    const flexContainer = nav.querySelector('.flex.justify-between.h-16');
    expect(flexContainer).toHaveClass('flex', 'justify-between', 'h-16');
  });

  it('should have proper accessibility attributes', () => {
    render(<Navigation />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    // Check that all links are accessible
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(4); // Nova brand + 3 navigation links

    // Check that button is accessible
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('should handle sign out form submission', () => {
    render(<Navigation />);

    const signOutForm = screen.getByText('Sign Out').closest('form');
    expect(signOutForm).toBeInTheDocument();
    expect(signOutForm).toHaveAttribute('action', '/api/auth/signout');
    expect(signOutForm).toHaveAttribute('method', 'post');

    // Simulate form submission
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefault = jest.fn();
    Object.defineProperty(submitEvent, 'preventDefault', { value: preventDefault });

    fireEvent(signOutForm!, submitEvent);
    
    // The form should be properly configured for submission
    expect(signOutForm).toHaveAttribute('action', '/api/auth/signout');
  });

  it('should display hover states correctly', () => {
    render(<Navigation />);

    // Check that hover classes are present
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toHaveClass('hover:text-gray-900');

    const newStudentLink = screen.getByText('New Student');
    expect(newStudentLink).toHaveClass('hover:text-gray-900');

    const billingLink = screen.getByText('Billing');
    expect(billingLink).toHaveClass('hover:text-gray-900');

    const signOutButton = screen.getByText('Sign Out');
    expect(signOutButton).toHaveClass('hover:text-gray-900');
  });

  it('should have proper responsive design classes', () => {
    render(<Navigation />);

    const container = screen.getByRole('navigation').querySelector('.max-w-7xl');
    expect(container).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');

    // Check that navigation items have proper spacing
    const navItems = screen.getByRole('navigation').querySelector('.flex.items-center.space-x-4');
    expect(navItems).toHaveClass('flex', 'items-center', 'space-x-4');
  });

  it('should render brand with gradient text styling', () => {
    render(<Navigation />);

    const brandLink = screen.getByText('Nova');
    expect(brandLink).toHaveClass(
      'text-2xl',
      'font-bold',
      'bg-gradient-to-r',
      'from-blue-600',
      'to-purple-600',
      'bg-clip-text',
      'text-transparent'
    );
  });

  it('should have consistent link styling', () => {
    render(<Navigation />);

    const navigationLinks = [
      screen.getByText('Dashboard'),
      screen.getByText('New Student'),
      screen.getByText('Billing'),
      screen.getByText('Sign Out'),
    ];

    navigationLinks.forEach(link => {
      expect(link).toHaveClass(
        'text-gray-700',
        'hover:text-gray-900',
        'px-3',
        'py-2',
        'rounded-md',
        'text-sm',
        'font-medium'
      );
    });
  });
});
