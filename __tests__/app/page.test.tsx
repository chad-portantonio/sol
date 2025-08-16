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
    
    expect(screen.getByText('Student Management')).toBeInTheDocument()
    expect(screen.getByText('Session Tracking')).toBeInTheDocument()
    expect(screen.getByText('Parent Communication')).toBeInTheDocument()
  })

  it('shows pricing information', () => {
    render(<HomePage />)
    
    expect(screen.getByText('$25')).toBeInTheDocument()
    expect(screen.getByText('per month')).toBeInTheDocument()
  })

  it('has call-to-action buttons', () => {
    render(<HomePage />)
    
    expect(screen.getByText("I'm a Tutor - Get Started")).toBeInTheDocument()
    expect(screen.getByText('Learn More')).toBeInTheDocument()
  })

  it('displays student limit information', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Up to 20 active students')).toBeInTheDocument()
  })

  it('shows feature list in pricing section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Unlimited sessions')).toBeInTheDocument()
    expect(screen.getByText('Parent communication')).toBeInTheDocument()
    expect(screen.getByText('Email reminders')).toBeInTheDocument()
  })

  it('has navigation with sign-in and sign-up links', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Sign In')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
  })

  it('has student and parent section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Are you a Student or Parent?')).toBeInTheDocument()
    expect(screen.getByText('Student Sign Up')).toBeInTheDocument()
    expect(screen.getByText('Student Sign In')).toBeInTheDocument()
  })
})
