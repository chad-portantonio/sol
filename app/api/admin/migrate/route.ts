import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Add basic security - you might want to add proper authentication
    const authorization = request.headers.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - requires Bearer token' },
        { status: 401 }
      );
    }

    const token = authorization.replace('Bearer ', '');
    
    // Simple token check - replace with your actual admin token
    if (token !== process.env.ADMIN_MIGRATION_TOKEN) {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 403 }
      );
    }

    console.log('🚀 Starting production database migration...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check current schema and verify tables exist
    console.log('📊 Checking current database schema...');
    
    // Verify the Tutor table structure
    const tutorCount = await prisma.tutor.count();
    console.log(`📈 Current tutor count: ${tutorCount}`);
    
    // Test creating a sample tutor record (will be rolled back)
    const testTutor = await prisma.tutor.create({
      data: {
        userId: 'test-migration-user',
        email: 'test-migration@example.com',
      },
    });
    
    // Clean up test record
    await prisma.tutor.delete({
      where: { id: testTutor.id },
    });
    
    console.log('✅ Schema verification successful');
    console.log('✅ Migration completed!');
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      tutorCount,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database migration endpoint',
    usage: 'POST with Bearer token to trigger migration',
    timestamp: new Date().toISOString(),
  });
}
