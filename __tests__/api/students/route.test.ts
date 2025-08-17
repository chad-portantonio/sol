import { NextRequest } from 'next/server'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  requireUser: jest.fn(() => ({ userId: 'test-user-id', email: 'test@example.com' })),
}))

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
    },
    student: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

import { POST, GET } from '@/app/api/students/route'

// Mock NextRequest
const createMockRequest = (method: string, body?: any) => {
  return {
    method,
    json: jest.fn().mockResolvedValue(body || {}),
    url: 'http://localhost:3000/api/students',
  } as any
}

// Get the mocked prisma instance
const { prisma } = require('@/lib/prisma')

describe('/api/students', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST', () => {
    it('creates a new student successfully', async () => {
      const mockTutor = {
        id: 'tutor-id',
        students: [],
      }
      
      const mockStudent = {
        id: 'student-id',
        fullName: 'John Doe',
        subject: 'Mathematics',
        year: 'Grade 10',
        active: true,
        parentEmail: 'parent@example.com',
        parentLinkToken: 'test-token-123',
        tutorId: 'tutor-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      prisma.tutor.findUnique.mockResolvedValue(mockTutor)
      prisma.student.create.mockResolvedValue(mockStudent)

      const request = createMockRequest('POST', {
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Mathematics',
        year: 'Grade 10',
        parentEmail: 'parent@example.com',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.student).toEqual(mockStudent)
      expect(prisma.student.create).toHaveBeenCalledWith({
        data: {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          subject: 'Mathematics',
          year: 'Grade 10',
          parentEmail: 'parent@example.com',
          tutorId: 'tutor-id',
          parentLinkToken: expect.any(String),
        },
      })
    })

    it('returns error when tutor not found', async () => {
      prisma.tutor.findUnique.mockResolvedValue(null)

      const request = createMockRequest('POST', {
        fullName: 'John Doe',
        subject: 'Mathematics',
        year: 'Grade 10',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Tutor not found')
    })

    it('returns error when student limit exceeded', async () => {
      const mockTutor = {
        id: 'tutor-id',
        students: Array(20).fill({ active: true }), // 20 active students
      }

      prisma.tutor.findUnique.mockResolvedValue(mockTutor)

      const request = createMockRequest('POST', {
        fullName: 'John Doe',
        subject: 'Mathematics',
        year: 'Grade 10',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Cannot exceed 20 active students')
    })

    it('validates required fields', async () => {
      // Reset mock to have no active students for this test
      prisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-id',
        students: [],
      })

      const request = createMockRequest('POST', {
        // Missing required fields
        fullName: '',
        subject: '',
        year: '',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Validation error')
    })
  })

  describe('GET', () => {
    it('fetches students successfully', async () => {
      const mockStudents = [
        {
          id: 'student-1',
          fullName: 'John Doe',
          subject: 'Mathematics',
          year: 'Grade 10',
          active: true,
          sessions: [],
        },
        {
          id: 'student-2',
          fullName: 'Jane Smith',
          subject: 'English',
          year: 'Grade 11',
          active: false,
          sessions: [],
        },
      ]

      prisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-id',
        students: mockStudents,
      })

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.students).toEqual(mockStudents)
    })

    it('returns error when tutor not found', async () => {
      prisma.tutor.findUnique.mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Tutor not found')
    })
  })
})
