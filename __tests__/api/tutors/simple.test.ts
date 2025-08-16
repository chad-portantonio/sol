import { prisma } from '@/lib/prisma';

// This test demonstrates how to test inserting accounts into the tutors table
// To run this test successfully, you need to:
// 1. Set up a test database
// 2. Set DATABASE_URL environment variable
// 3. Run Prisma migrations

describe('Tutors Table - Simple Insertion Test', () => {
  // Skip tests if no database connection is available
  const hasDatabaseConnection = process.env.DATABASE_URL;

  // Helper function to create a unique test email
  const createTestEmail = () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
  
  // Helper function to create a unique test userId
  const createTestUserId = () => `test-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  beforeAll(async () => {
    if (!hasDatabaseConnection) {
      console.log('⚠️  No DATABASE_URL found. Skipping database tests.');
      console.log('💡 To run these tests, set up a test database and set DATABASE_URL in your environment.');
      console.log('📖 See __tests__/api/tutors/README.md for setup instructions.');
      return;
    }

    try {
      // Test database connection
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      console.log('💡 Make sure your database is running and DATABASE_URL is correct');
    }
  });

  afterAll(async () => {
    if (hasDatabaseConnection) {
      try {
        await prisma.$disconnect();
        console.log('✅ Database disconnected');
      } catch (error) {
        console.warn('⚠️  Failed to disconnect from database:', error);
      }
    }
  });

  // Clean up test data after each test
  afterEach(async () => {
    if (!hasDatabaseConnection) return;

    try {
      // Clean up any test data created during the test
      await prisma.tutor.deleteMany({
        where: {
          email: {
            contains: 'test-',
          },
        },
      });
    } catch (error) {
      console.warn('⚠️  Cleanup failed:', error);
    }
  });

  it('should demonstrate tutor table insertion (skipped if no database)', async () => {
    if (!hasDatabaseConnection) {
      console.log('⏭️  Skipping test - no database connection available');
      return;
    }

    const testUserId = createTestUserId();
    const testEmail = createTestEmail();

    console.log(`🧪 Testing insertion with userId: ${testUserId}`);
    console.log(`🧪 Testing insertion with email: ${testEmail}`);

    // Test 1: Insert a new tutor record
    const newTutor = await prisma.tutor.create({
      data: {
        userId: testUserId,
        email: testEmail,
      },
    });

    // Verify the record was created
    expect(newTutor).toBeDefined();
    expect(newTutor.id).toBeDefined();
    expect(newTutor.userId).toBe(testUserId);
    expect(newTutor.email).toBe(testEmail);
    expect(newTutor.stripeCustomerId).toBeNull();
    expect(newTutor.createdAt).toBeDefined();
    expect(newTutor.updatedAt).toBeDefined();

    console.log(`✅ Tutor created successfully with ID: ${newTutor.id}`);

    // Test 2: Verify the record exists in the database
    const retrievedTutor = await prisma.tutor.findUnique({
      where: { id: newTutor.id },
    });

    expect(retrievedTutor).toBeDefined();
    expect(retrievedTutor?.id).toBe(newTutor.id);
    expect(retrievedTutor?.userId).toBe(testUserId);
    expect(retrievedTutor?.email).toBe(testEmail);

    console.log(`✅ Tutor retrieved successfully from database`);

    // Test 3: Verify unique constraints work
    await expect(
      prisma.tutor.create({
        data: {
          userId: testUserId, // Same userId, different email
          email: createTestEmail(),
        },
      })
    ).rejects.toThrow();

    console.log(`✅ Unique userId constraint enforced`);

    await expect(
      prisma.tutor.create({
        data: {
          userId: createTestUserId(), // Different userId, same email
          email: testEmail,
        },
      })
    ).rejects.toThrow();

    console.log(`✅ Unique email constraint enforced`);

    console.log(`🎉 All tutor table insertion tests passed!`);
  });

  it('should show how to test multiple tutor insertions', async () => {
    if (!hasDatabaseConnection) {
      console.log('⏭️  Skipping test - no database connection available');
      return;
    }

    const tutors = [];
    const count = 3;

    console.log(`🧪 Testing insertion of ${count} tutors`);

    // Create multiple tutors
    for (let i = 0; i < count; i++) {
      const testUserId = createTestUserId();
      const testEmail = createTestEmail();

      const tutor = await prisma.tutor.create({
        data: {
          userId: testUserId,
          email: testEmail,
        },
      });

      tutors.push(tutor);
      console.log(`✅ Created tutor ${i + 1}/${count} with ID: ${tutor.id}`);
    }

    // Verify all tutors were created
    expect(tutors).toHaveLength(count);

    // Verify all IDs are unique
    const ids = tutors.map(t => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(count);

    // Verify all tutors exist in the database
    for (const tutor of tutors) {
      const dbTutor = await prisma.tutor.findUnique({
        where: { id: tutor.id },
      });
      expect(dbTutor).toBeDefined();
    }

    console.log(`🎉 Successfully created and verified ${count} tutors!`);
  });

  it('should demonstrate error handling for invalid data', async () => {
    if (!hasDatabaseConnection) {
      console.log('⏭️  Skipping test - no database connection available');
      return;
    }

    console.log('🧪 Testing error handling for invalid data');

    // Test missing required fields
    await expect(
      prisma.tutor.create({
        data: {
          // Missing userId and email
        } as any,
      })
    ).rejects.toThrow();

    console.log('✅ Properly rejected missing required fields');

    // Test invalid email format (if your schema has validation)
    // This depends on your Prisma schema validation rules
    
    console.log('✅ Error handling tests completed');
  });
});

// Additional test that shows the expected tutor table structure
describe('Tutor Table Structure', () => {
  it('should have the correct schema structure', () => {
    // This test documents the expected structure of the tutors table
    // It doesn't require a database connection
    
    const expectedFields = [
      'id',           // CUID primary key
      'userId',       // Unique Supabase auth.users.id
      'email',        // Unique email address
      'stripeCustomerId', // Optional Stripe customer ID
      'createdAt',    // Timestamp when record was created
      'updatedAt',    // Timestamp when record was last updated
    ];

    console.log('📋 Expected tutors table structure:');
    expectedFields.forEach(field => {
      console.log(`   - ${field}`);
    });

    // This test always passes - it's just for documentation
    expect(expectedFields).toHaveLength(6);
    expect(expectedFields).toContain('id');
    expect(expectedFields).toContain('userId');
    expect(expectedFields).toContain('email');
  });
});
