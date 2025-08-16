import { render, screen } from '@testing-library/react'
import PricingPage from '@/app/pricing/page'

describe('PricingPage', () => {
  it('renders pricing information', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Simple, Transparent Pricing')).toBeInTheDocument()
    expect(screen.getByText('Nova Pro')).toBeInTheDocument()
    expect(screen.getByText('$25')).toBeInTheDocument()
    expect(screen.getByText('per month')).toBeInTheDocument()
  })

  it('displays feature list', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Up to 20 active students')).toBeInTheDocument()
    expect(screen.getByText('Unlimited sessions')).toBeInTheDocument()
    expect(screen.getByText('Session notes & homework tracking')).toBeInTheDocument()
    expect(screen.getByText('Parent communication portal')).toBeInTheDocument()
    expect(screen.getByText('Email reminders for upcoming sessions')).toBeInTheDocument()
    expect(screen.getByText('Professional dashboard & reporting')).toBeInTheDocument()
    expect(screen.getByText('Mobile-responsive design')).toBeInTheDocument()
    expect(screen.getByText('Priority customer support')).toBeInTheDocument()
  })

  it('has call-to-action buttons', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument()
    expect(screen.getByText('Get Started Free')).toBeInTheDocument()
    expect(screen.getByText('Back to Home')).toBeInTheDocument()
  })

  it('displays FAQ section', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    expect(screen.getByText('What happens if I exceed 20 active students?')).toBeInTheDocument()
    expect(screen.getByText('Can I cancel my subscription?')).toBeInTheDocument()
    expect(screen.getByText('Is there a setup fee?')).toBeInTheDocument()
    expect(screen.getByText('Do you offer refunds?')).toBeInTheDocument()
    expect(screen.getByText('Can I export my data?')).toBeInTheDocument()
  })

  it('shows pricing details', () => {
    render(<PricingPage />)
    
    expect(screen.getByText('One plan. Everything you need to manage your tutoring business. No hidden fees, no surprises.')).toBeInTheDocument()
    expect(screen.getByText('Perfect for professional tutors who want to scale their business')).toBeInTheDocument()
    expect(screen.getByText('No credit card required • Cancel anytime')).toBeInTheDocument()
  })

  it('has proper navigation links', () => {
    render(<PricingPage />)
    
    const signUpLink = screen.getByText('Start Free Trial').closest('a')
    const homeLink = screen.getByText('Back to Home').closest('a')
    
    expect(signUpLink).toHaveAttribute('href', '/sign-up')
    expect(homeLink).toHaveAttribute('href', '/')
  })
})

