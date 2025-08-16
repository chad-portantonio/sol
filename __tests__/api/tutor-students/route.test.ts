import { NextRequest } from 'next/server';

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  requireUser: jest.fn(() => ({ userId: 'test-user-id', email: 'test@example.com' })),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
    },
    tutorStudent: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

import { POST, GET } from '@/app/api/tutor-students/route';

// Mock NextRequest
const createMockRequest = (method: string, body?: any) => {
  return {
    method,
    json: jest.fn().mockResolvedValue(body || {}),
    url: 'http://localhost:3000/api/tutor-students',
  } as any;
};

// Get the mocked prisma instance
const { prisma } = require('@/lib/prisma');

describe('/api/tutor-students', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('creates a new tutor-student relationship successfully', async () => {
      const mockTutor = {
        id: 'tutor-id',
        userId: 'test-user-id',
        email: 'tutor@example.com',
      };

      const mockStudent = {
        id: 'student-id',
        fullName: 'John Doe',
        subject: 'Mathematics',
        year: 'Grade 10',
        active: true,
      };

      const mockTutorStudent = {
        id: 'tutor-student-id',
        tutorId: 'tutor-id',
        studentId: 'student-id',
        subject: 'Advanced Mathematics',
        notes: 'Special focus on algebra',
        active: true,
        startDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        student: mockStudent,
        tutor: mockTutor,
      };

      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.tutorStudent.findUnique.mockResolvedValue(null); // No existing relationship
      prisma.tutorStudent.create.mockResolvedValue(mockTutorStudent);

      const request = createMockRequest('POST', {
        studentId: 'student-id',
        subject: 'Advanced Mathematics',
        notes: 'Special focus on algebra',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tutorStudent).toEqual(mockTutorStudent);
      expect(prisma.tutorStudent.create).toHaveBeenCalledWith({
        data: {
          tutorId: 'tutor-id',
          studentId: 'student-id',
          subject: 'Advanced Mathematics',
          notes: 'Special focus on algebra',
        },
        include: {
          student: true,
          tutor: true,
        },
      });
    });

    it('returns error when tutor not found', async () => {
      prisma.tutor.findUnique.mockResolvedValue(null);

      const request = createMockRequest('POST', {
        studentId: 'student-id',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Tutor not found');
    });

    it('returns error when student not found', async () => {
      const mockTutor = { id: 'tutor-id', userId: 'test-user-id' };
      
      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.student.findUnique.mockResolvedValue(null);

      const request = createMockRequest('POST', {
        studentId: 'nonexistent-student',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Student not found');
    });

    it('returns error when relationship already exists', async () => {
      const mockTutor = { id: 'tutor-id', userId: 'test-user-id' };
      const mockStudent = { id: 'student-id', fullName: 'John Doe' };
      const existingRelationship = { id: 'existing-id' };

      prisma.tutor.findUnique.mockResolvedValue(mockTutor);
      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.tutorStudent.findUnique.mockResolvedValue(existingRelationship);

      const request = createMockRequest('POST', {
        studentId: 'student-id',
        subject: 'Mathematics',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Tutor-student relationship already exists');
    });

    it('validates required fields', async () => {
      const mockTutor = { id: 'tutor-id', userId: 'test-user-id' };
      prisma.tutor.findUnique.mockResolvedValue(mockTutor);

      const request = createMockRequest('POST', {
        // Missing studentId and subject
        notes: 'Some notes',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
      expect(data.details).toBeDefined();
    });
  });

  describe('GET', () => {
    it('fetches tutor-student relationships successfully', async () => {
      const mockTutorStudents = [
        {
          id: 'ts-1',
          subject: 'Mathematics',
          active: true,
          startDate: new Date(),
          student: {
            id: 'student-1',
            fullName: 'John Doe',
            year: 'Grade 10',
            sessions: [],
          },
        },
        {
          id: 'ts-2',
          subject: 'Physics',
          active: true,
          startDate: new Date(),
          student: {
            id: 'student-2',
            fullName: 'Jane Smith',
            year: 'Grade 11',
            sessions: [],
          },
        },
      ];

      prisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-id',
        tutorStudents: mockTutorStudents,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tutorStudents).toEqual(mockTutorStudents);
    });

    it('returns error when tutor not found', async () => {
      prisma.tutor.findUnique.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Tutor not found');
    });

    it('returns empty array when no relationships exist', async () => {
      prisma.tutor.findUnique.mockResolvedValue({
        id: 'tutor-id',
        tutorStudents: [],
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tutorStudents).toEqual([]);
    });
  });
});
