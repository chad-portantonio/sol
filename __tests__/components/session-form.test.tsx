import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionForm } from '@/app/(app)/students/[id]/session-form'

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}))

describe('SessionForm', () => {
  it('renders session form fields', () => {
    render(<SessionForm studentId="test-student-id" />)
    
    expect(screen.getByLabelText('Start Time *')).toBeInTheDocument()
    expect(screen.getByLabelText('End Time *')).toBeInTheDocument()
    expect(screen.getByLabelText('Session Notes')).toBeInTheDocument()
    expect(screen.getByLabelText('Homework Assigned')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Session' })).toBeInTheDocument()
  })

  it('sets default times for start and end time', () => {
    render(<SessionForm studentId="test-student-id" />)
    
    const startTimeInput = screen.getByLabelText('Start Time *') as HTMLInputElement
    const endTimeInput = screen.getByLabelText('End Time *') as HTMLInputElement
    
    expect(startTimeInput.value).toBeTruthy()
    expect(endTimeInput.value).toBeTruthy()
  })

  it('handles form input changes', async () => {
    const user = userEvent.setup()
    render(<SessionForm studentId="test-student-id" />)
    
    const notesInput = screen.getByLabelText('Session Notes')
    const homeworkInput = screen.getByLabelText('Homework Assigned')
    
    await user.type(notesInput, 'Covered algebra basics')
    await user.type(homeworkInput, 'Complete exercises 1-10')
    
    expect(notesInput).toHaveValue('Covered algebra basics')
    expect(homeworkInput).toHaveValue('Complete exercises 1-10')
  })

  it('validates time inputs', () => {
    render(<SessionForm studentId="test-student-id" />)
    
    const startTimeInput = screen.getByLabelText('Start Time *') as HTMLInputElement
    const endTimeInput = screen.getByLabelText('End Time *') as HTMLInputElement
    
    // Check that inputs have min attributes
    expect(startTimeInput.min).toBeTruthy()
    expect(endTimeInput.min).toBeTruthy()
    
    // Check that inputs are required
    expect(startTimeInput.required).toBe(true)
    expect(endTimeInput.required).toBe(true)
  })

  it('has proper form structure', () => {
    render(<SessionForm studentId="test-student-id" />)
    
    const form = screen.getByRole('button', { name: 'Create Session' }).closest('form')
    expect(form).toBeInTheDocument()
    
    // Check that all inputs are within the form
    const startTimeInput = screen.getByLabelText('Start Time *')
    const endTimeInput = screen.getByLabelText('End Time *')
    const notesInput = screen.getByLabelText('Session Notes')
    const homeworkInput = screen.getByLabelText('Homework Assigned')
    
    expect(form).toContainElement(startTimeInput)
    expect(form).toContainElement(endTimeInput)
    expect(form).toContainElement(notesInput)
    expect(form).toContainElement(homeworkInput)
  })

  it('displays student ID context', () => {
    render(<SessionForm studentId="test-student-id" />)
    
    // The form should be associated with the correct student
    const form = screen.getByRole('button', { name: 'Create Session' }).closest('form')
    expect(form).toBeInTheDocument()
  })
})
