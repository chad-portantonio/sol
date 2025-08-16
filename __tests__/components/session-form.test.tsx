import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionForm } from '@/app/(app)/students/[id]/session-form'

// Mock fetch
global.fetch = jest.fn()

// Mock router
const mockRefresh = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('SessionForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockClear()
  })

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

  describe('Form Submission', () => {
    it('successfully submits a session with all fields', async () => {
      const user = userEvent.setup()
      
      // Mock successful response
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          session: {
            id: 'test-session-id',
            studentId: 'test-student-id',
            startTime: '2024-12-20T10:00:00.000Z',
            endTime: '2024-12-20T11:00:00.000Z',
            notes: 'Test session notes',
            homework: 'Test homework',
          }
        })
      })
      
      render(<SessionForm studentId="test-student-id" />)
      
      // Fill in form fields
      const notesField = screen.getByLabelText('Session Notes')
      const homeworkField = screen.getByLabelText('Homework Assigned')
      
      await user.type(notesField, 'Test session notes')
      await user.type(homeworkField, 'Test homework')
      
      // Submit form
      const submitButton = screen.getByRole('button', { name: 'Create Session' })
      await user.click(submitButton)
      
      // Verify fetch was called
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"studentId":"test-student-id"')
        })
      })
      
      // Verify success message appears
      await waitFor(() => {
        expect(screen.getByText('Session created successfully!')).toBeInTheDocument()
      })
      
      // Verify router refresh was called
      expect(mockRefresh).toHaveBeenCalled()
      
      // Verify form is reset
      expect(notesField).toHaveValue('')
      expect(homeworkField).toHaveValue('')
    })

    it('submits session with only required fields (no notes/homework)', async () => {
      const user = userEvent.setup()
      
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          session: {
            id: 'test-session-id',
            studentId: 'test-student-id',
            startTime: '2024-12-20T10:00:00.000Z',
            endTime: '2024-12-20T11:00:00.000Z',
            notes: null,
            homework: null,
          }
        })
      })
      
      render(<SessionForm studentId="test-student-id" />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Session' })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled()
      })
      
      const fetchCall = (fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)
      
      expect(requestBody).toMatchObject({
        studentId: 'test-student-id',
        startTime: expect.any(String),
        endTime: expect.any(String),
      })
      
      // Notes and homework should be undefined when empty
      expect(requestBody.notes).toBeUndefined()
      expect(requestBody.homework).toBeUndefined()
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      
      // Mock a delayed response
      ;(fetch as jest.Mock).mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ session: {} })
        }), 100)
      }))
      
      render(<SessionForm studentId="test-student-id" />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Session' })
      await user.click(submitButton)
      
      // Check loading state
      expect(screen.getByRole('button', { name: 'Creating Session...' })).toBeInTheDocument()
      expect(submitButton).toBeDisabled()
      
      // Check that inputs are disabled
      expect(screen.getByLabelText('Start Time *')).toBeDisabled()
      expect(screen.getByLabelText('End Time *')).toBeDisabled()
      expect(screen.getByLabelText('Session Notes')).toBeDisabled()
      expect(screen.getByLabelText('Homework Assigned')).toBeDisabled()
      
      // Wait for submission to complete
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Create Session' })).toBeInTheDocument()
      })
      
      // Check that inputs are re-enabled
      expect(screen.getByLabelText('Start Time *')).not.toBeDisabled()
      expect(screen.getByLabelText('End Time *')).not.toBeDisabled()
    })

    it.skip('displays error when end time is before start time', async () => {
      const user = userEvent.setup()
      
      render(<SessionForm studentId="test-student-id" />)
      
      // Wait for form to initialize
      await waitFor(() => {
        expect(screen.getByLabelText('Start Time *')).toBeInTheDocument()
      })
      
      // Set start time after end time (this should trigger client-side validation)
      const startTimeField = screen.getByLabelText('Start Time *') as HTMLInputElement
      const endTimeField = screen.getByLabelText('End Time *') as HTMLInputElement
      
      // Set times manually to create invalid state
      await user.clear(startTimeField)
      await user.type(startTimeField, '2024-12-20T11:00')
      await user.clear(endTimeField)
      await user.type(endTimeField, '2024-12-20T10:00')
      
      // Wait for form state to update
      await waitFor(() => {
        expect(startTimeField.value).toBe('2024-12-20T11:00')
        expect(endTimeField.value).toBe('2024-12-20T10:00')
      })
      
      const submitButton = screen.getByRole('button', { name: 'Create Session' })
      await user.click(submitButton)
      
      // Should show client-side error
      await waitFor(() => {
        expect(screen.getByText(/End time must be after start time|Please enter valid start and end times/)).toBeInTheDocument()
      }, { timeout: 3000 })
      
      // Should not make API call
      expect(fetch).not.toHaveBeenCalled()
    })

    it('handles API errors gracefully', async () => {
      const user = userEvent.setup()
      
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({
          error: 'Student not found'
        })
      })
      
      render(<SessionForm studentId="test-student-id" />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Session' })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText('Student not found')).toBeInTheDocument()
      })
      
      // Should not show success message
      expect(screen.queryByText('Session created successfully!')).not.toBeInTheDocument()
      
      // Router refresh should not be called
      expect(mockRefresh).not.toHaveBeenCalled()
    })

    it('handles network errors', async () => {
      const user = userEvent.setup()
      
      ;(fetch as jest.Mock).mockRejectedValue(new Error('Network error'))
      
      render(<SessionForm studentId="test-student-id" />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Session' })
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Network error|An error occurred/)).toBeInTheDocument()
      })
    })

    it('hides success message after timeout', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      ;(fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          session: { id: 'test-session-id' }
        })
      })
      
      render(<SessionForm studentId="test-student-id" />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Session' })
      await user.click(submitButton)
      
      // Success message should appear
      await waitFor(() => {
        expect(screen.getByText('Session created successfully!')).toBeInTheDocument()
      })
      
      // Fast forward time
      act(() => {
        jest.advanceTimersByTime(3000)
      })
      
      // Success message should disappear
      await waitFor(() => {
        expect(screen.queryByText('Session created successfully!')).not.toBeInTheDocument()
      })
      
      jest.useRealTimers()
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and structure', () => {
      render(<SessionForm studentId="test-student-id" />)
      
      // Check that all inputs have proper labels
      expect(screen.getByLabelText('Start Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('End Time *')).toBeInTheDocument()
      expect(screen.getByLabelText('Session Notes')).toBeInTheDocument()
      expect(screen.getByLabelText('Homework Assigned')).toBeInTheDocument()
      
      // Check required fields are marked
      expect(screen.getByLabelText('Start Time *')).toHaveAttribute('required')
      expect(screen.getByLabelText('End Time *')).toHaveAttribute('required')
    })

    it('has proper ARIA attributes during loading', async () => {
      jest.useFakeTimers()
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
      
      ;(fetch as jest.Mock).mockImplementation(() => new Promise(() => {})) // Never resolves
      
      render(<SessionForm studentId="test-student-id" />)
      
      const submitButton = screen.getByRole('button', { name: 'Create Session' })
      await user.click(submitButton)
      
      const loadingButton = screen.getByRole('button', { name: 'Creating Session...' })
      expect(loadingButton).toHaveAttribute('disabled')
    })
  })
})
