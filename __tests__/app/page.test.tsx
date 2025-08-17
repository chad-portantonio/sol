import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders Nova branding', () => {
    render(<HomePage />)
    
    // Check for main heading (should be unique)
    expect(screen.getByRole('heading', { level: 1, name: 'Nova' })).toBeInTheDocument()
    // Since the content changes based on student/tutor toggle, check for student view (default)
    expect(screen.getByText('Connect with Caribbean Tutors Today')).toBeInTheDocument()
  })

  it('displays feature cards', () => {
    render(<HomePage />)
    
    // Default view should show student features
    expect(screen.getByText('Find Verified Tutors')).toBeInTheDocument()
    expect(screen.getByText('Work with Multiple Tutors')).toBeInTheDocument()
    expect(screen.getByText('Track Your Progress')).toBeInTheDocument()
  })

  it('shows pricing information', () => {
    render(<HomePage />)
    
    expect(screen.getByText('$25')).toBeInTheDocument()
    expect(screen.getByText('per month')).toBeInTheDocument()
  })

  it('has call-to-action buttons', () => {
    render(<HomePage />)
    
    // Student view buttons (default)
    expect(screen.getByText('Browse Tutors')).toBeInTheDocument()
    expect(screen.getByText('Create Free Account')).toBeInTheDocument()
  })

  it('displays student limit information', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Up to 20 active students')).toBeInTheDocument()
  })

  it('shows feature list in pricing section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Unlimited sessions')).toBeInTheDocument()
    expect(screen.getByText('Parent communication portal')).toBeInTheDocument()
    expect(screen.getByText('Email reminders & notifications')).toBeInTheDocument()
  })

  it('has navigation with sign-in and sign-up links', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('has student and parent section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('For Students & Parents')).toBeInTheDocument()
    expect(screen.getByText('Student Portal')).toBeInTheDocument()
    expect(screen.getByText('Already Registered?')).toBeInTheDocument()
  })

  it('has correct student portal links', () => {
    render(<HomePage />)
    
    const studentPortalLink = screen.getByText('Student Portal').closest('a')
    const alreadyRegisteredLink = screen.getByText('Already Registered?').closest('a')
    
    expect(studentPortalLink).toHaveAttribute('href', '/student-sign-up')
    expect(alreadyRegisteredLink).toHaveAttribute('href', '/student-sign-in')
  })
})
