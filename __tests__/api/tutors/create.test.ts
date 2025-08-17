import { NextRequest, NextResponse } from 'next/server';
import { POST } from '@/app/api/tutors/create/route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tutor: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('/api/tutors/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Tutor Creation', () => {
    it('should create a tutor record successfully', async () => {
      const mockTutor = {
        id: 'tutor123',
        userId: 'user123',
        email: 'test@example.com',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(null); // No existing tutor
      (mockPrisma.tutor.create as jest.Mock).mockResolvedValue(mockTutor);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user123',
          email: 'test@example.com',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Tutor record created successfully');
      expect(data.tutor).toEqual(mockTutor);
      expect(mockPrisma.tutor.create).toHaveBeenCalledWith({
        data: {
          userId: 'user123',
          email: 'test@example.com',
        },
      });
    });

    it('should handle tutor creation with valid data types', async () => {
      const mockTutor = {
        id: 'tutor456',
        userId: 'user456',
        email: 'another@example.com',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(null); // No existing tutor
      (mockPrisma.tutor.create as jest.Mock).mockResolvedValue(mockTutor);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user456',
          email: 'another@example.com',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tutor.userId).toBe('user456');
      expect(data.tutor.email).toBe('another@example.com');
      expect(data.tutor.stripeCustomerId).toBeNull();
    });
  });

  describe('Input Validation', () => {
    it('should return 400 for missing userId', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          email: 'test@example.com',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
      expect(mockPrisma.tutor.create).not.toHaveBeenCalled();
    });

    it('should return 400 for missing email', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user123',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
      expect(mockPrisma.tutor.create).not.toHaveBeenCalled();
    });

    it('should return 400 for empty request body', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({}),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
      expect(mockPrisma.tutor.create).not.toHaveBeenCalled();
    });

    it('should return 400 for null values', async () => {
      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: null,
          email: null,
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing required fields');
      expect(mockPrisma.tutor.create).not.toHaveBeenCalled();
    });
  });

  describe('Database Constraint Handling', () => {
    it('should return 409 for duplicate userId constraint violation', async () => {
      const duplicateError = new Error('Unique constraint failed on the fields: (`userId`)');
      (mockPrisma.tutor.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrisma.tutor.create as jest.Mock).mockRejectedValue(duplicateError);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user123',
          email: 'test@example.com',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Tutor record already exists');
    });

    it('should return 409 for duplicate email constraint violation', async () => {
      const duplicateError = new Error('Unique constraint failed on the fields: (`email`)');
      (mockPrisma.tutor.create as jest.Mock).mockRejectedValue(duplicateError);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user456',
          email: 'existing@example.com',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Tutor record already exists');
    });

    it('should return 409 for any unique constraint violation', async () => {
      const duplicateError = new Error('Unique constraint failed on the fields: (`userId`, `email`)');
      (mockPrisma.tutor.create as jest.Mock).mockRejectedValue(duplicateError);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user123',
          email: 'test@example.com',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toBe('Tutor record already exists');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for other database errors', async () => {
      const dbError = new Error('Database connection failed');
      (mockPrisma.tutor.create as jest.Mock).mockRejectedValue(dbError);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user123',
          email: 'test@example.com',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create tutor record');
    });

    it('should handle malformed JSON gracefully', async () => {
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
      } as any;

      const response = await POST(mockRequest);
      
      // Should return an error status
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle Prisma validation errors', async () => {
      const validationError = new Error('Invalid input: email must be a valid email address');
      (mockPrisma.tutor.create as jest.Mock).mockRejectedValue(validationError);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user123',
          email: 'invalid-email',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create tutor record');
    });
  });

  describe('Request Processing', () => {
    it('should process valid JSON request correctly', async () => {
      const mockTutor = {
        id: 'tutor789',
        userId: 'user789',
        email: 'valid@example.com',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.tutor.create as jest.Mock).mockResolvedValue(mockTutor);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user789',
          email: 'valid@example.com',
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tutor.userId).toBe('user789');
      expect(data.tutor.email).toBe('valid@example.com');
    });

    it('should handle request with extra fields gracefully', async () => {
      const mockTutor = {
        id: 'tutor999',
        userId: 'user999',
        email: 'extra@example.com',
        stripeCustomerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (mockPrisma.tutor.create as jest.Mock).mockResolvedValue(mockTutor);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({
          userId: 'user999',
          email: 'extra@example.com',
          extraField: 'should be ignored',
          anotherField: 123,
        }),
      } as any;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tutor.userId).toBe('user999');
      expect(data.tutor.email).toBe('extra@example.com');
      
      // Should only pass required fields to Prisma
      expect(mockPrisma.tutor.create).toHaveBeenCalledWith({
        data: {
          userId: 'user999',
          email: 'extra@example.com',
        },
      });
    });
  });
});
