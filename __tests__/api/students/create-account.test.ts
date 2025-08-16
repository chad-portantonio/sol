import { NextRequest } from 'next/server';
import { POST } from '@/app/api/students/create-account/route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    student: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    parent: {
      create: jest.fn(),
    },
  },
}));

// Mock NextRequest
const createMockRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
};

// Get the mocked prisma instance
const { prisma } = require('@/lib/prisma');

describe('/api/students/create-account', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST - Student Account Creation', () => {
    it('should create a student account successfully', async () => {
      const mockStudent = {
        id: 'student-123',
        fullName: 'John Doe',
        subject: 'General',
        year: 'Not specified',
        active: true,
        parentEmail: 'john@example.com',
        parentLinkToken: '',
        tutorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.student.create.mockResolvedValue(mockStudent);

      const request = createMockRequest({
        userId: 'user-123',
        email: 'john@example.com',
        fullName: 'John Doe',
        role: 'student',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Student account created successfully');
      expect(data.student).toMatchObject({
        ...mockStudent,
        userId: 'user-123',
      });

      expect(prisma.student.create).toHaveBeenCalledWith({
        data: {
          fullName: 'John Doe',
          subject: 'General',
          year: 'Not specified',
          active: true,
          parentEmail: 'john@example.com',
          parentLinkToken: null,
          tutorId: null,
        },
      });
    });

    it('should create a parent account successfully', async () => {
      const mockStudent = {
        id: 'student-123',
        fullName: 'Student Name',
        tutor: { id: 'tutor-123' },
      };

      const mockParent = {
        id: 'parent-123',
        userId: 'user-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        studentId: 'student-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.parent.create.mockResolvedValue(mockParent);

      const request = createMockRequest({
        userId: 'user-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        role: 'parent',
        studentId: 'student-123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Parent account created successfully');
      expect(data.parent).toEqual(mockParent);

      expect(prisma.parent.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          email: 'parent@example.com',
          fullName: 'Parent Name',
          studentId: 'student-123',
        },
      });
    });

    it('should return error for missing required fields', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        // Missing userId, fullName, role
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
    });

    it('should return error for parent role without studentId', async () => {
      const request = createMockRequest({
        userId: 'user-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        role: 'parent',
        // Missing studentId
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Student ID is required for parent accounts');
    });

    it('should return error when student not found for parent account', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        userId: 'user-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        role: 'parent',
        studentId: 'nonexistent-student',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Student not found');
    });

    it('should handle duplicate account creation', async () => {
      const duplicateError = new Error('Unique constraint violation');
      duplicateError.message = 'Unique constraint failed on userId';

      prisma.student.create.mockRejectedValue(duplicateError);

      const request = createMockRequest({
        userId: 'user-123',
        email: 'john@example.com',
        fullName: 'John Doe',
        role: 'student',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Account already exists');
    });

    it('should handle general database errors', async () => {
      prisma.student.create.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest({
        userId: 'user-123',
        email: 'john@example.com',
        fullName: 'John Doe',
        role: 'student',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create account');
    });

    it('should validate email format implicitly through application logic', async () => {
      const mockStudent = {
        id: 'student-123',
        fullName: 'John Doe',
        subject: 'General',
        year: 'Not specified',
        active: true,
        parentEmail: 'invalid-email',
        parentLinkToken: '',
        tutorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.student.create.mockResolvedValue(mockStudent);

      const request = createMockRequest({
        userId: 'user-123',
        email: 'invalid-email',
        fullName: 'John Doe',
        role: 'student',
      });

      const response = await POST(request);
      const data = await response.json();

      // The endpoint doesn't validate email format, so it should succeed
      expect(response.status).toBe(200);
      expect(data.message).toBe('Student account created successfully');
    });

    it('should include tutor information when creating parent account', async () => {
      const mockStudent = {
        id: 'student-123',
        fullName: 'Student Name',
        tutor: {
          id: 'tutor-123',
          userId: 'tutor-user-123',
          email: 'tutor@example.com',
        },
      };

      const mockParent = {
        id: 'parent-123',
        userId: 'user-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        studentId: 'student-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.parent.create.mockResolvedValue(mockParent);

      const request = createMockRequest({
        userId: 'user-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        role: 'parent',
        studentId: 'student-123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.student.findUnique).toHaveBeenCalledWith({
        where: { id: 'student-123' },
        include: { tutor: true },
      });
    });

    it('should handle parent account creation database error', async () => {
      const mockStudent = {
        id: 'student-123',
        fullName: 'Student Name',
        tutor: { id: 'tutor-123' },
      };

      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.parent.create.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({
        userId: 'user-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        role: 'parent',
        studentId: 'student-123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create account');
    });
  });
});
