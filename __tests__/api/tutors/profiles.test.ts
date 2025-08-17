import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/tutors/profiles/route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    tutorProfile: {
      findMany: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

import { prisma } from '@/lib/prisma';

describe('/api/tutors/profiles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns paginated tutor profiles', async () => {
      const mockProfiles = [
        {
          id: '1',
          tutorId: 'tutor-1',
          displayName: 'John Doe',
          bio: 'Math tutor',
          subjects: ['Mathematics'],
          experience: '5 years',
          hourlyRate: '$25/hour',
          availability: 'Weekdays',
          profileImage: 'https://example.com/image.jpg',
          country: 'Jamaica',
          city: 'Kingston',
          address: '123 Main St',
          rating: 4.5,
          totalReviews: 10,
          totalSessions: 50,
          verified: true,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          tutor: {
            id: 'tutor-1',
            email: 'john@example.com',
            createdAt: new Date(),
          },
        },
      ];

      (prisma.tutorProfile.findMany as jest.Mock).mockResolvedValue(mockProfiles);
      (prisma.tutorProfile.count as jest.Mock).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles?page=1&limit=12');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tutors).toHaveLength(1);
      expect(data.pagination.totalPages).toBe(1);
      expect(data.pagination.currentPage).toBe(1);
      expect(data.pagination.totalCount).toBe(1);
    });

    it('filters by subject when provided', async () => {
      (prisma.tutorProfile.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.tutorProfile.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles?subject=Mathematics');
      await GET(request);

      expect(prisma.tutorProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subjects: { hasSome: ['Mathematics'] },
          }),
        })
      );
    });

    it('handles pagination correctly', async () => {
      (prisma.tutorProfile.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.tutorProfile.count as jest.Mock).mockResolvedValue(25);

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles?page=2&limit=10');
      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination.currentPage).toBe(2);
      expect(data.pagination.totalPages).toBe(3);
      expect(data.pagination.totalCount).toBe(25);
    });

    it('returns empty results when no profiles found', async () => {
      (prisma.tutorProfile.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.tutorProfile.count as jest.Mock).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tutors).toHaveLength(0);
      expect(data.pagination.totalCount).toBe(0);
    });
  });

  describe('POST', () => {
    it('creates a new tutor profile successfully', async () => {
      const profileData = {
        tutorId: 'tutor-1',
        displayName: 'Jane Smith',
        bio: 'Physics tutor',
        subjects: ['Physics', 'Mathematics'],
        experience: '3 years',
        hourlyRate: '$30/hour',
        availability: 'Weekends',
        profileImage: 'https://example.com/avatar.jpg',
        country: 'Trinidad and Tobago',
        city: 'Port of Spain',
        address: '456 Oak St',
      };

      // Mock tutor exists
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: 'tutor-1',
        email: 'jane@example.com'
      });

      (prisma.tutorProfile.upsert as jest.Mock).mockResolvedValue({
        id: 'profile-1',
        ...profileData,
      });

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles', {
        method: 'POST',
        body: JSON.stringify(profileData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Tutor profile saved successfully');
      expect(prisma.tutorProfile.upsert).toHaveBeenCalledWith({
        where: { tutorId: 'tutor-1' },
        update: profileData,
        create: profileData,
      });
    });

    it('requires all mandatory fields', async () => {
      const incompleteData = {
        tutorId: 'tutor-1',
        displayName: 'Jane Smith',
        // Missing subjects, profileImage, country, city
      };

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles', {
        method: 'POST',
        body: JSON.stringify(incompleteData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });

    it('validates subjects array', async () => {
      const invalidData = {
        tutorId: 'tutor-1',
        displayName: 'Jane Smith',
        subjects: 'Mathematics', // Should be array
        profileImage: 'https://example.com/avatar.jpg',
        country: 'Jamaica',
        city: 'Kingston',
      };

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('subjects must be an array');
    });

    it('validates subjects array is not empty', async () => {
      const invalidData = {
        tutorId: 'tutor-1',
        displayName: 'Jane Smith',
        subjects: [], // Empty array
        profileImage: 'https://example.com/avatar.jpg',
        country: 'Jamaica',
        city: 'Kingston',
      };

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('subjects array cannot be empty');
    });

    it('handles database errors gracefully', async () => {
      const profileData = {
        tutorId: 'tutor-1',
        displayName: 'Jane Smith',
        subjects: ['Physics'],
        profileImage: 'https://example.com/avatar.jpg',
        country: 'Jamaica',
        city: 'Kingston',
      };

      (prisma.tutorProfile.upsert as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles', {
        method: 'POST',
        body: JSON.stringify(profileData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Internal server error');
    });

    it('updates existing profile when tutorId exists', async () => {
      const profileData = {
        tutorId: 'existing-tutor',
        displayName: 'Updated Name',
        subjects: ['Mathematics'],
        profileImage: 'https://example.com/new-avatar.jpg',
        country: 'Barbados',
        city: 'Bridgetown',
      };

      // Mock tutor exists
      (prisma.tutor.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-tutor',
        email: 'existing@example.com'
      });

      (prisma.tutorProfile.upsert as jest.Mock).mockResolvedValue({
        id: 'existing-profile',
        ...profileData,
      });

      const request = new NextRequest('http://localhost:3000/api/tutors/profiles', {
        method: 'POST',
        body: JSON.stringify(profileData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Tutor profile saved successfully');
      expect(prisma.tutorProfile.upsert).toHaveBeenCalledWith({
        where: { tutorId: 'existing-tutor' },
        update: profileData,
        create: profileData,
      });
    });
  });

  describe('Error Handling', () => {
    it('handles malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/tutors/profiles', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid JSON');
    });

    it('handles missing request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/tutors/profiles', {
        method: 'POST',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Request body is required');
    });
  });
});
