import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

describe('HomePage', () => {
  it('renders Nova branding', () => {
    render(<HomePage />)
    
    // Check for main heading (should be unique)
    expect(screen.getByRole('heading', { level: 1, name: 'Nova' })).toBeInTheDocument()
    expect(screen.getByText('Professional Tutoring Management Platform')).toBeInTheDocument()
  })

  it('displays feature cards', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/student management/i)).toBeInTheDocument()
    expect(screen.getByText(/session tracking/i)).toBeInTheDocument()
    expect(screen.getByText(/parent communication/i)).toBeInTheDocument()
  })

  it('shows pricing information', () => {
    render(<HomePage />)
    
    expect(screen.getByText('$25')).toBeInTheDocument()
    expect(screen.getByText('per month')).toBeInTheDocument()
  })

  it('has call-to-action buttons', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Start Your Journey')).toBeInTheDocument()
    expect(screen.getByText('View Pricing')).toBeInTheDocument()
  })

  it('displays student limit information', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Up to 20 active students')).toBeInTheDocument()
  })

  it('shows feature list in pricing section', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/unlimited sessions/i)).toBeInTheDocument()
    expect(screen.getByText(/parent communication/i)).toBeInTheDocument()
    expect(screen.getByText(/email reminders/i)).toBeInTheDocument()
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
})
