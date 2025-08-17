import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/sessions/route';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Helper function to create mock requests
function createMockRequest(body?: any, searchParams?: string): NextRequest {
  const url = searchParams ? `http://localhost/api/sessions${searchParams}` : 'http://localhost/api/sessions';
  const mockUrl = new URL(url);
  return {
    json: () => Promise.resolve(body),
    url: url,
    headers: new Map(),
  } as any;
}

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    student: {
      findFirst: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

const mockRequireUser = requireUser as jest.MockedFunction<typeof requireUser>;
const mockPrisma = prisma as any;

describe('/api/sessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireUser.mockResolvedValue({ 
      userId: 'test-user-id',
      email: 'test@example.com'
    });
  });

  describe('POST - Create Session', () => {
    const validSessionData = {
      studentId: 'test-student-id',
      subject: 'Mathematics',
      startTime: '2024-12-20T10:00:00.000Z',
      endTime: '2024-12-20T11:00:00.000Z',
      notes: 'Covered algebra basics',
      homework: 'Complete exercises 1-10',
    };

    const mockStudent = {
      id: 'test-student-id',
      fullName: 'John Doe',
      subject: 'Mathematics',
      year: 'Year 10',
      parentEmail: 'parent@example.com',
      active: true,
      tutorId: 'test-tutor-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      parentLinkToken: 'test-token',
    };

    const mockSession = {
      id: 'test-session-id',
      studentId: 'test-student-id',
      startTime: new Date('2024-12-20T10:00:00.000Z'),
      endTime: new Date('2024-12-20T11:00:00.000Z'),
      notes: 'Covered algebra basics',
      homework: 'Complete exercises 1-10',
      createdAt: new Date(),
      updatedAt: new Date(),
      student: {
        fullName: 'John Doe',
        parentEmail: 'parent@example.com',
      },
    };

    it('should create a session successfully', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.session.create.mockResolvedValue(mockSession);

      const request = createMockRequest(validSessionData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ session: mockSession });
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          id: validSessionData.studentId,
          tutor: { userId: 'test-user-id' },
        },
      });
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          studentId: validSessionData.studentId,
          subject: validSessionData.subject,
          startTime: new Date(validSessionData.startTime),
          endTime: new Date(validSessionData.endTime),
          status: 'scheduled',
          notes: validSessionData.notes,
          homework: validSessionData.homework,
        },
        include: {
          student: {
            select: {
              fullName: true,
              parentEmail: true,
            },
          },
        },
      });
    });

    it('should create a session with minimal data (no notes/homework)', async () => {
      const minimalData = {
        studentId: 'test-student-id',
        startTime: '2024-12-20T10:00:00.000Z',
        endTime: '2024-12-20T11:00:00.000Z',
      };

      const mockMinimalSession = {
        ...mockSession,
        notes: null,
        homework: null,
      };

      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.session.create.mockResolvedValue(mockMinimalSession);

      const request = createMockRequest(minimalData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ session: mockMinimalSession });
      expect(mockPrisma.session.create).toHaveBeenCalledWith({
        data: {
          studentId: minimalData.studentId,
          startTime: new Date(minimalData.startTime),
          endTime: new Date(minimalData.endTime),
          notes: null,
          homework: null,
        },
        include: {
          student: {
            select: {
              fullName: true,
              parentEmail: true,
            },
          },
        },
      });
    });

    it('should return 400 if end time is before start time', async () => {
      const invalidData = {
        ...validSessionData,
        startTime: '2024-12-20T11:00:00.000Z',
        endTime: '2024-12-20T10:00:00.000Z', // End before start
      };

      const request = createMockRequest(invalidData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'End time must be after start time',
      });
      expect(mockPrisma.student.findFirst).not.toHaveBeenCalled();
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it('should return 400 if end time equals start time', async () => {
      const invalidData = {
        ...validSessionData,
        startTime: '2024-12-20T10:00:00.000Z',
        endTime: '2024-12-20T10:00:00.000Z', // Same time
      };

      const request = createMockRequest(invalidData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'End time must be after start time',
      });
    });

    it('should return 404 if student not found', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const request = createMockRequest(validSessionData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'Student not found',
      });
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid request body', async () => {
      const invalidData = {
        studentId: '', // Empty string
        startTime: '', // Empty string
        // Missing endTime
      };

      const request = createMockRequest(invalidData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
      expect(data.details).toBeDefined();
      expect(Array.isArray(data.details)).toBe(true);
    });

    it('should return 500 for database errors', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.session.create.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest(validSessionData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create session',
      });
    });

    it('should handle authentication errors', async () => {
      mockRequireUser.mockRejectedValue(new Error('Unauthorized'));

      const request = createMockRequest(validSessionData);

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to create session',
      });
    });
  });

  describe('GET - Fetch Sessions', () => {
    const mockSessions = [
      {
        id: 'session-1',
        studentId: 'test-student-id',
        startTime: new Date('2024-12-20T10:00:00.000Z'),
        endTime: new Date('2024-12-20T11:00:00.000Z'),
        notes: 'First session',
        homework: 'Homework 1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'session-2',
        studentId: 'test-student-id',
        startTime: new Date('2024-12-19T10:00:00.000Z'),
        endTime: new Date('2024-12-19T11:00:00.000Z'),
        notes: 'Second session',
        homework: 'Homework 2',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockStudent = {
      id: 'test-student-id',
      fullName: 'John Doe',
      subject: 'Mathematics',
      year: 'Year 10',
      parentEmail: 'parent@example.com',
      active: true,
      tutorId: 'test-tutor-id',
      createdAt: new Date(),
      updatedAt: new Date(),
      parentLinkToken: 'test-token',
    };

    it('should fetch sessions for a student', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.session.findMany.mockResolvedValue(mockSessions);

      const request = createMockRequest(undefined, '?studentId=test-student-id');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ sessions: mockSessions });
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-student-id',
          tutor: { userId: 'test-user-id' },
        },
      });
      expect(mockPrisma.session.findMany).toHaveBeenCalledWith({
        where: { studentId: 'test-student-id' },
        orderBy: { startTime: 'desc' },
      });
    });

    it('should return 400 if studentId is missing', async () => {
      const request = createMockRequest();

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        error: 'Student ID is required',
      });
      expect(mockPrisma.student.findFirst).not.toHaveBeenCalled();
    });

    it('should return 404 if student not found', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const request = createMockRequest(undefined, '?studentId=test-student-id');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({
        error: 'Student not found',
      });
      expect(mockPrisma.session.findMany).not.toHaveBeenCalled();
    });

    it('should return empty array for student with no sessions', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.session.findMany.mockResolvedValue([]);

      const request = createMockRequest(undefined, '?studentId=test-student-id');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ sessions: [] });
    });

    it('should handle database errors', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.session.findMany.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest(undefined, '?studentId=test-student-id');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        error: 'Failed to fetch sessions',
      });
    });
  });
});
