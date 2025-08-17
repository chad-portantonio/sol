import { NextRequest } from 'next/server';
import { POST } from '@/app/api/student-accounts/create/route';

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

// Mock crypto for consistent token generation
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-random-token')
  }))
}));

const createMockRequest = (body: any) => {
  return {
    json: jest.fn().mockResolvedValue(body),
  } as any;
};

const { prisma } = require('@/lib/prisma');

describe('/api/student-accounts/create - Unified Student API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Independent Student Creation', () => {
    it('should create an independent student account successfully', async () => {
      const mockStudent = {
        id: 'student-123',
        userId: 'auth-user-123',
        email: 'john@example.com',
        fullName: 'John Doe',
        preferredSubjects: ['Mathematics', 'Physics'],
        gradeLevel: 'Grade 11',
        bio: 'I love learning!',
        active: true,
        tutorId: null,
        subject: null,
        year: null,
        parentEmail: null,
        parentLinkToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tutorConnections: [],
      };

      prisma.student.findUnique.mockResolvedValue(null); // No existing student
      prisma.student.create.mockResolvedValue(mockStudent);

      const request = createMockRequest({
        userId: 'auth-user-123',
        email: 'john@example.com',
        fullName: 'John Doe',
        preferredSubjects: ['Mathematics', 'Physics'],
        gradeLevel: 'Grade 11',
        bio: 'I love learning!',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Student account created successfully');
      expect(data.student).toMatchObject({
        id: 'student-123',
        userId: 'auth-user-123',
        email: 'john@example.com',
        fullName: 'John Doe',
        preferredSubjects: ['Mathematics', 'Physics'],
        gradeLevel: 'Grade 11',
        bio: 'I love learning!',
      });

      expect(prisma.student.create).toHaveBeenCalledWith({
        data: {
          email: 'john@example.com',
          fullName: 'John Doe',
          preferredSubjects: ['Mathematics', 'Physics'],
          gradeLevel: 'Grade 11',
          bio: 'I love learning!',
          active: true,
          userId: 'auth-user-123',
        },
        include: {
          tutor: false,
          tutorConnections: {
            include: {
              tutor: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });
    });

    it('should handle missing optional fields for independent students', async () => {
      const mockStudent = {
        id: 'student-456',
        userId: 'auth-user-456',
        email: 'jane@example.com',
        fullName: 'Jane Smith',
        preferredSubjects: [],
        gradeLevel: null,
        bio: null,
        active: true,
        tutorId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        tutorConnections: [],
      };

      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockResolvedValue(mockStudent);

      const request = createMockRequest({
        userId: 'auth-user-456',
        email: 'jane@example.com',
        fullName: 'Jane Smith',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.student.preferredSubjects).toEqual([]);
      expect(data.student.gradeLevel).toBeNull();
      expect(data.student.bio).toBeNull();
    });

    it('should detect existing student by userId', async () => {
      const existingStudent = {
        id: 'existing-student',
        userId: 'auth-user-123',
        email: 'existing@example.com',
        fullName: 'Existing Student',
      };

      prisma.student.findUnique.mockResolvedValueOnce(existingStudent); // First call for userId check

      const request = createMockRequest({
        userId: 'auth-user-123',
        email: 'newemail@example.com',
        fullName: 'New Name',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe('Student account already exists');
      expect(data.student).toEqual(existingStudent);
      expect(prisma.student.create).not.toHaveBeenCalled();
    });

    it('should detect existing student by email', async () => {
      const existingStudent = {
        id: 'existing-student',
        userId: 'different-auth-user',
        email: 'existing@example.com',
        fullName: 'Existing Student',
      };

      prisma.student.findUnique
        .mockResolvedValueOnce(null) // First call for userId check
        .mockResolvedValueOnce(existingStudent); // Second call for email check

      const request = createMockRequest({
        userId: 'new-auth-user',
        email: 'existing@example.com',
        fullName: 'New Name',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.message).toBe('Student account already exists');
      expect(data.student).toEqual(existingStudent);
    });
  });

  describe('Tutor-Created Student (Legacy Support)', () => {
    it('should create a tutor-created student with legacy fields', async () => {
      const mockStudent = {
        id: 'legacy-student-123',
        userId: null, // No auth user for tutor-created students
        email: 'legacy@example.com',
        fullName: 'Legacy Student',
        preferredSubjects: ['Mathematics'],
        gradeLevel: 'Grade 10',
        bio: null,
        active: true,
        tutorId: 'tutor-123',
        subject: 'Mathematics',
        year: 'Grade 10',
        parentEmail: 'legacy@example.com',
        parentLinkToken: 'mock-random-token',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockResolvedValue(mockStudent);

      const request = createMockRequest({
        email: 'legacy@example.com',
        fullName: 'Legacy Student',
        preferredSubjects: ['Mathematics'],
        gradeLevel: 'Grade 10',
        tutorId: 'tutor-123',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.student.tutorId).toBe('tutor-123');
      expect(data.student.subject).toBe('Mathematics');
      expect(data.student.year).toBe('Grade 10');
      expect(data.student.parentEmail).toBe('legacy@example.com');
      expect(data.student.parentLinkToken).toBe('mock-random-token');

      expect(prisma.student.create).toHaveBeenCalledWith({
        data: {
          email: 'legacy@example.com',
          fullName: 'Legacy Student',
          preferredSubjects: ['Mathematics'],
          gradeLevel: 'Grade 10',
          bio: null,
          active: true,
          tutorId: 'tutor-123',
          subject: 'Mathematics',
          year: 'Grade 10',
          parentEmail: 'legacy@example.com',
          parentLinkToken: 'mock-random-token',
        },
        include: {
          tutor: true,
          tutorConnections: {
            include: {
              tutor: {
                include: {
                  profile: true
                }
              }
            }
          }
        }
      });
    });
  });

  describe('Parent Account Creation', () => {
    it('should create a parent account successfully', async () => {
      const mockStudent = {
        id: 'student-for-parent',
        fullName: 'Child Student',
        tutor: { id: 'tutor-123' },
      };

      const mockParent = {
        id: 'parent-123',
        userId: 'parent-auth-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        studentId: 'student-for-parent',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.student.findUnique.mockResolvedValue(mockStudent);
      prisma.parent.create.mockResolvedValue(mockParent);

      const request = createMockRequest({
        userId: 'parent-auth-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        role: 'parent',
        studentId: 'student-for-parent',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Parent account created successfully');
      expect(data.parent).toEqual(mockParent);

      expect(prisma.parent.create).toHaveBeenCalledWith({
        data: {
          userId: 'parent-auth-123',
          email: 'parent@example.com',
          fullName: 'Parent Name',
          studentId: 'student-for-parent',
        },
      });
    });

    it('should return error when student not found for parent account', async () => {
      prisma.student.findUnique.mockResolvedValue(null);

      const request = createMockRequest({
        userId: 'parent-auth-123',
        email: 'parent@example.com',
        fullName: 'Parent Name',
        role: 'parent',
        studentId: 'nonexistent-student',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Student not found');
      expect(prisma.parent.create).not.toHaveBeenCalled();
    });

    it('should return error for parent role without studentId', async () => {
      const request = createMockRequest({
        userId: 'parent-auth-123',
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
  });

  describe('Validation', () => {
    it('should return error for missing email', async () => {
      const request = createMockRequest({
        fullName: 'Test Student',
        // Missing email
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: email and fullName are required');
    });

    it('should return error for missing fullName', async () => {
      const request = createMockRequest({
        email: 'test@example.com',
        // Missing fullName
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields: email and fullName are required');
    });

    it('should handle invalid preferredSubjects gracefully', async () => {
      const mockStudent = {
        id: 'student-123',
        preferredSubjects: [],
        // ... other fields
      };

      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockResolvedValue(mockStudent);

      const request = createMockRequest({
        email: 'test@example.com',
        fullName: 'Test Student',
        preferredSubjects: 'not-an-array', // Invalid type
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Should convert invalid input to empty array
      expect(prisma.student.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          preferredSubjects: [],
        }),
        include: expect.any(Object)
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest({
        email: 'test@example.com',
        fullName: 'Test Student',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create student account');
    });

    it('should handle unique constraint violations', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockRejectedValue(new Error('Unique constraint failed'));

      const request = createMockRequest({
        email: 'test@example.com',
        fullName: 'Test Student',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Student account already exists');
    });

    it('should handle connection errors with graceful degradation', async () => {
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockRejectedValue(new Error('prepared statement error'));

      const request = createMockRequest({
        email: 'test@example.com',
        fullName: 'Test Student',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(202);
      expect(data.message).toBe('Account setup in progress');
    });
  });

  describe('Data Consistency', () => {
    it('should maintain referential integrity for tutor-created students', async () => {
      const mockStudent = {
        id: 'student-123',
        tutorId: 'tutor-123',
        subject: 'Mathematics',
        year: 'Grade 10',
        parentEmail: 'test@example.com',
        parentLinkToken: 'mock-random-token',
      };

      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockResolvedValue(mockStudent);

      const request = createMockRequest({
        email: 'test@example.com',
        fullName: 'Test Student',
        preferredSubjects: ['Mathematics', 'Physics'],
        gradeLevel: 'Grade 10',
        tutorId: 'tutor-123',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      
      // Verify that legacy fields are properly set
      const createCall = prisma.student.create.mock.calls[0][0];
      expect(createCall.data).toMatchObject({
        tutorId: 'tutor-123',
        subject: 'Mathematics', // First subject from preferredSubjects
        year: 'Grade 10', // Maps from gradeLevel
        parentEmail: 'test@example.com',
        parentLinkToken: 'mock-random-token',
      });
    });

    it('should properly structure includes based on student type', async () => {
      // Test independent student (no tutorId)
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockResolvedValue({});

      const independentRequest = createMockRequest({
        userId: 'auth-123',
        email: 'independent@example.com',
        fullName: 'Independent Student',
      });

      await POST(independentRequest);

      const independentCall = prisma.student.create.mock.calls[0][0];
      expect(independentCall.include.tutor).toBe(false);

      // Clear mocks
      jest.clearAllMocks();

      // Test tutor-created student (has tutorId)
      prisma.student.findUnique.mockResolvedValue(null);
      prisma.student.create.mockResolvedValue({});

      const tutorCreatedRequest = createMockRequest({
        email: 'tutorcreated@example.com',
        fullName: 'Tutor Created Student',
        tutorId: 'tutor-123',
      });

      await POST(tutorCreatedRequest);

      const tutorCreatedCall = prisma.student.create.mock.calls[0][0];
      expect(tutorCreatedCall.include.tutor).toBe(true);
    });
  });
});
