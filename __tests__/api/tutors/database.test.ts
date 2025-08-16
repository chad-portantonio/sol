import { prisma } from '@/lib/prisma';

describe('Tutors Table - Direct Database Tests', () => {
  // Clean up test data after each test
  afterEach(async () => {
    try {
      await prisma.tutor.deleteMany({
        where: {
          email: {
            contains: 'test-',
          },
        },
      });
    } catch (error) {
      console.warn('Cleanup failed:', error);
    }
  });

  // Clean up all test data after all tests
  afterAll(async () => {
    try {
      await prisma.tutor.deleteMany({
        where: {
          email: {
            contains: 'test-',
          },
        },
      });
      await prisma.$disconnect();
    } catch (error) {
      console.warn('Final cleanup failed:', error);
    }
  });

  it('should insert a new tutor record into the database', async () => {
    const testUserId = `test-user-${Date.now()}`;
    const testEmail = `test-${Date.now()}@example.com`;

    // Insert the tutor record directly using Prisma
    const newTutor = await prisma.tutor.create({
      data: {
        userId: testUserId,
        email: testEmail,
      },
    });

    // Verify the record was created with expected values
    expect(newTutor).toBeDefined();
    expect(newTutor.id).toBeDefined();
    expect(newTutor.userId).toBe(testUserId);
    expect(newTutor.email).toBe(testEmail);
    expect(newTutor.stripeCustomerId).toBeNull();
    expect(newTutor.createdAt).toBeDefined();
    expect(newTutor.updatedAt).toBeDefined();

    // Verify the record exists in the database
    const retrievedTutor = await prisma.tutor.findUnique({
      where: { id: newTutor.id },
    });

    expect(retrievedTutor).toBeDefined();
    expect(retrievedTutor?.id).toBe(newTutor.id);
    expect(retrievedTutor?.userId).toBe(testUserId);
    expect(retrievedTutor?.email).toBe(testEmail);
  });

  it('should enforce unique userId constraint', async () => {
    const testUserId = `test-user-${Date.now()}`;
    const testEmail1 = `test-${Date.now()}-1@example.com`;
    const testEmail2 = `test-${Date.now()}-2@example.com`;

    // First insertion should succeed
    const firstTutor = await prisma.tutor.create({
      data: {
        userId: testUserId,
        email: testEmail1,
      },
    });

    expect(firstTutor).toBeDefined();

    // Second insertion with same userId should fail
    await expect(
      prisma.tutor.create({
        data: {
          userId: testUserId,
          email: testEmail2,
        },
      })
    ).rejects.toThrow();
  });

  it('should enforce unique email constraint', async () => {
    const testUserId1 = `test-user-${Date.now()}-1`;
    const testUserId2 = `test-user-${Date.now()}-2`;
    const testEmail = `test-${Date.now()}@example.com`;

    // First insertion should succeed
    const firstTutor = await prisma.tutor.create({
      data: {
        userId: testUserId1,
        email: testEmail,
      },
    });

    expect(firstTutor).toBeDefined();

    // Second insertion with same email should fail
    await expect(
      prisma.tutor.create({
        data: {
          userId: testUserId2,
          email: testEmail,
        },
      })
    ).rejects.toThrow();
  });

  it('should generate unique CUID for each tutor', async () => {
    const tutors = [];
    
    // Create multiple tutors
    for (let i = 0; i < 5; i++) {
      const testUserId = `test-user-${Date.now()}-${i}`;
      const testEmail = `test-${Date.now()}-${i}@example.com`;

      const tutor = await prisma.tutor.create({
        data: {
          userId: testUserId,
          email: testEmail,
        },
      });

      tutors.push(tutor);
    }

    // Verify all IDs are unique
    const ids = tutors.map(t => t.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(5);
    expect(ids.length).toBe(5);

    // Verify all IDs follow CUID pattern (start with 'c')
    for (const id of ids) {
      expect(id).toMatch(/^c[a-z0-9]{24}$/);
    }
  });

  it('should set proper default values for timestamps', async () => {
    const testUserId = `test-user-${Date.now()}`;
    const testEmail = `test-${Date.now()}@example.com`;

    const beforeInsert = new Date();
    
    const tutor = await prisma.tutor.create({
      data: {
        userId: testUserId,
        email: testEmail,
      },
    });

    const afterInsert = new Date();

    // Verify timestamps are within reasonable bounds
    expect(tutor.createdAt.getTime()).toBeGreaterThanOrEqual(beforeInsert.getTime());
    expect(tutor.createdAt.getTime()).toBeLessThanOrEqual(afterInsert.getTime());
    expect(tutor.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeInsert.getTime());
    expect(tutor.updatedAt.getTime()).toBeLessThanOrEqual(afterInsert.getTime());

    // Verify createdAt and updatedAt are initially the same
    expect(tutor.createdAt.getTime()).toBe(tutor.updatedAt.getTime());
  });

  it('should allow updating tutor records', async () => {
    const testUserId = `test-user-${Date.now()}`;
    const testEmail = `test-${Date.now()}@example.com`;

    // Create the tutor
    const tutor = await prisma.tutor.create({
      data: {
        userId: testUserId,
        email: testEmail,
      },
    });

    const originalUpdatedAt = tutor.updatedAt;

    // Wait a bit to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    // Update the tutor
    const updatedTutor = await prisma.tutor.update({
      where: { id: tutor.id },
      data: {
        stripeCustomerId: 'cus_test123',
      },
    });

    // Verify the update
    expect(updatedTutor.stripeCustomerId).toBe('cus_test123');
    expect(updatedTutor.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    expect(updatedTutor.createdAt.getTime()).toBe(tutor.createdAt.getTime());
  });

  it('should handle bulk operations correctly', async () => {
    const testData = [];
    
    // Prepare test data
    for (let i = 0; i < 10; i++) {
      testData.push({
        userId: `test-user-${Date.now()}-${i}`,
        email: `test-${Date.now()}-${i}@example.com`,
      });
    }

    // Insert all tutors
    const createdTutors = await Promise.all(
      testData.map(data => 
        prisma.tutor.create({ data })
      )
    );

    expect(createdTutors).toHaveLength(10);

    // Verify all were created with unique IDs
    const ids = createdTutors.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);

    // Verify we can retrieve all of them
    const retrievedTutors = await prisma.tutor.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    expect(retrievedTutors).toHaveLength(10);
  });

  it('should handle deletion correctly', async () => {
    const testUserId = `test-user-${Date.now()}`;
    const testEmail = `test-${Date.now()}@example.com`;

    // Create the tutor
    const tutor = await prisma.tutor.create({
      data: {
        userId: testUserId,
        email: testEmail,
      },
    });

    // Verify it exists
    const retrievedTutor = await prisma.tutor.findUnique({
      where: { id: tutor.id },
    });
    expect(retrievedTutor).toBeDefined();

    // Delete the tutor
    await prisma.tutor.delete({
      where: { id: tutor.id },
    });

    // Verify it no longer exists
    const deletedTutor = await prisma.tutor.findUnique({
      where: { id: tutor.id },
    });
    expect(deletedTutor).toBeNull();
  });
});
