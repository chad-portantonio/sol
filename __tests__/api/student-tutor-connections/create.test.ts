/**
 * Tests for student-tutor connection creation API
 * This covers the many-to-many relationship logic
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/student-tutor-connections/route';

// Mock dependencies
jest.mock('@supabase/ssr');
jest.mock('next/headers');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    student: {
      findUnique: jest.fn(),
    },
    tutor: {
      findUnique: jest.fn(),
    },
    studentTutorConnection: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
};

const mockCookies = jest.fn().mockResolvedValue({
  getAll: jest.fn(() => []),
  set: jest.fn(),
});

const mockCreateServerClient = jest.fn(() => mockSupabase);

// Setup mocks
beforeEach(() => {
  jest.clearAllMocks();
  (require('@supabase/ssr').createServerClient as jest.Mock) = mockCreateServerClient;
  (require('next/headers').cookies as jest.Mock) = mockCookies;
});

const { prisma } = require('@/lib/prisma');

const createMockRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
};

describe('/api/student-tutor-connections POST', () => {
  describe('Successful Connection Creation', () => {
    it('should create a new student-tutor connection successfully', async () => {
      // Mock authentication
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'student-auth-123' } },
        error: null,
      });

      // Mock student lookup
      const mockStudent = {
        id: 'student-123',
        fullName: 'Test Student',
        email: 'student@example.com',
        preferredSubjects: ['Mathematics'],
        gradeLevel: 'Grade 11',
      };
      prisma.student.findUnique.mockResolvedValue(mockStudent);

      // Mock no existing connection
      prisma.studentTutorConnection.findUnique.mockResolvedValue(null);

      // Mock tutor lookup
      const mockTutor = {
        id: 'tutor-123',
        profile: {
          displayName: 'Test Tutor',
          subjects: ['Mathematics', 'Physics'],
        },
      };
      prisma.tutor.findUnique.mockResolvedValue(mockTutor);

      // Mock connection creation
      const mockConnection = {
        id: 'connection-123',
        studentId: 'student-123',
        tutorId: 'tutor-123',
        subject: 'Mathematics',
        status: 'pending',
        requestMessage: 'I would like to learn Mathematics',
        createdAt: new Date(),
        student: mockStudent,
        tutor: mockTutor,
      };
      prisma.studentTutorConnection.create.mockResolvedValue(mockConnection);

      const request = createMockRequest({
        tutorId: 'tutor-123',
        subject: 'Mathematics',
        requestMessage: 'I would like to learn Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Connection request sent successfully');
      expect(data.connection).toEqual(mockConnection);

      // Verify database calls
      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { userId: 'student-auth-123' },
      });

      expect(prisma.studentTutorConnection.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_tutorId_subject: {
            studentId: 'student-123',
            tutorId: 'tutor-123',
            subject: 'Mathematics',
          },
        },
      });

      expect(prisma.tutor.findUnique).toHaveBeenCalledWith({
        where: { id: 'tutor-123' },
        include: { profile: true },
      });

      expect(prisma.studentTutorConnection.create).toHaveBeenCalledWith({
        data: {
          studentId: 'student-123',
          tutorId: 'tutor-123',
          subject: 'Mathematics',
          requestMessage: 'I would like to learn Mathematics',
          status: 'pending',
        },
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              preferredSubjects: true,
              gradeLevel: true,
            },
          },
          tutor: {
            include: {
              profile: true,
            },
          },
        },
      });
    });

    it('should handle connection creation without request message', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'student-auth-456' } },
        error: null,
      });

      const mockStudent = { id: 'student-456' };
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.studentTutorConnection.findUnique.mockResolvedValue(null);
      prisma.tutor.findUnique.mockResolvedValue({ id: 'tutor-456', profile: {} });
      prisma.studentTutorConnection.create.mockResolvedValue({});

      const request = createMockRequest({
        tutorId: 'tutor-456',
        subject: 'English',
        // No requestMessage provided
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(prisma.studentTutorConnection.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          requestMessage: null,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('Authentication and Authorization', () => {
    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      const request = createMockRequest({
        tutorId: 'tutor-123',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
      expect(prisma.student.findUnique).not.toHaveBeenCalled();
    });

    it('should return 404 when student account not found', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'nonexistent-student' } },
        error: null,
      });

      prisma.student.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        tutorId: 'tutor-123',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Student account not found. Please create a student account first.');
    });
  });

  describe('Input Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'valid-student' } },
        error: null,
      });
      prisma.student.findUnique.mockResolvedValue({ id: 'student-123' });
    });

    it('should return 400 for missing tutorId', async () => {
      const request = createMockRequest({
        subject: 'Mathematics',
        // Missing tutorId
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: tutorId and subject are required');
    });

    it('should return 400 for missing subject', async () => {
      const request = createMockRequest({
        tutorId: 'tutor-123',
        // Missing subject
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: tutorId and subject are required');
    });

    it('should return 400 for empty request body', async () => {
      const request = createMockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: tutorId and subject are required');
    });
  });

  describe('Business Logic Validation', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'valid-student' } },
        error: null,
      });
      prisma.student.findUnique.mockResolvedValue({ id: 'student-123' });
    });

    it('should return 409 for duplicate connection requests', async () => {
      const existingConnection = {
        id: 'existing-connection',
        studentId: 'student-123',
        tutorId: 'tutor-123',
        subject: 'Mathematics',
        status: 'pending',
      };

      prisma.studentTutorConnection.findUnique.mockResolvedValue(existingConnection);

      const request = createMockRequest({
        tutorId: 'tutor-123',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Connection request already exists for this tutor and subject');
      expect(prisma.tutor.findUnique).not.toHaveBeenCalled();
      expect(prisma.studentTutorConnection.create).not.toHaveBeenCalled();
    });

    it('should return 404 when tutor not found', async () => {
      prisma.studentTutorConnection.findUnique.mockResolvedValue(null);
      prisma.tutor.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        tutorId: 'nonexistent-tutor',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Tutor not found');
      expect(prisma.studentTutorConnection.create).not.toHaveBeenCalled();
    });

    it('should allow multiple connections for different subjects with same tutor', async () => {
      prisma.studentTutorConnection.findUnique.mockResolvedValue(null); // No existing connection for Physics
      prisma.tutor.findUnique.mockResolvedValue({ id: 'tutor-123', profile: {} });
      prisma.studentTutorConnection.create.mockResolvedValue({});

      const request = createMockRequest({
        tutorId: 'tutor-123',
        subject: 'Physics', // Different subject than Mathematics
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(prisma.studentTutorConnection.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_tutorId_subject: {
            studentId: 'student-123',
            tutorId: 'tutor-123',
            subject: 'Physics',
          },
        },
      });
    });

    it('should allow connections with different tutors for same subject', async () => {
      prisma.studentTutorConnection.findUnique.mockResolvedValue(null);
      prisma.tutor.findUnique.mockResolvedValue({ id: 'tutor-456', profile: {} });
      prisma.studentTutorConnection.create.mockResolvedValue({});

      const request = createMockRequest({
        tutorId: 'tutor-456', // Different tutor
        subject: 'Mathematics',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(prisma.studentTutorConnection.findUnique).toHaveBeenCalledWith({
        where: {
          studentId_tutorId_subject: {
            studentId: 'student-123',
            tutorId: 'tutor-456',
            subject: 'Mathematics',
          },
        },
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'valid-student' } },
        error: null,
      });
      prisma.student.findUnique.mockResolvedValue({ id: 'student-123' });
      prisma.studentTutorConnection.findUnique.mockResolvedValue(null);
      prisma.tutor.findUnique.mockResolvedValue({ id: 'tutor-123', profile: {} });
    });

    it('should handle database errors gracefully', async () => {
      prisma.studentTutorConnection.create.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest({
        tutorId: 'tutor-123',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create connection request');
    });

    it('should handle authentication service errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Auth service unavailable'));

      const request = createMockRequest({
        tutorId: 'tutor-123',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create connection request');
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any;

      const response = await POST(request);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('Data Integrity', () => {
    it('should include all necessary data in response', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'student-auth-123' } },
        error: null,
      });

      const mockStudent = {
        id: 'student-123',
        fullName: 'Test Student',
        email: 'student@example.com',
        preferredSubjects: ['Mathematics'],
        gradeLevel: 'Grade 11',
      };

      const mockTutor = {
        id: 'tutor-123',
        profile: {
          displayName: 'Test Tutor',
          subjects: ['Mathematics', 'Physics'],
          verified: true,
        },
      };

      const mockConnection = {
        id: 'connection-123',
        studentId: 'student-123',
        tutorId: 'tutor-123',
        subject: 'Mathematics',
        status: 'pending',
        requestMessage: 'Test message',
        responseMessage: null,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        student: mockStudent,
        tutor: mockTutor,
      };

      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.studentTutorConnection.findUnique.mockResolvedValue(null);
      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.studentTutorConnection.create.mockResolvedValue(mockConnection);

      const request = createMockRequest({
        tutorId: 'tutor-123',
        subject: 'Mathematics',
        requestMessage: 'Test message',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.connection).toMatchObject({
        id: 'connection-123',
        studentId: 'student-123',
        tutorId: 'tutor-123',
        subject: 'Mathematics',
        status: 'pending',
        requestMessage: 'Test message',
        student: mockStudent,
        tutor: mockTutor,
      });

      // Verify the include structure was correct
      expect(prisma.studentTutorConnection.create).toHaveBeenCalledWith({
        data: expect.any(Object),
        include: {
          student: {
            select: {
              id: true,
              fullName: true,
              email: true,
              preferredSubjects: true,
              gradeLevel: true,
            },
          },
          tutor: {
            include: {
              profile: true,
            },
          },
        },
      });
    });
  });
});
