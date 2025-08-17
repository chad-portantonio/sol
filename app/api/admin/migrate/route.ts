import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Only allow admin users or specific emails for security
    const { email } = await requireUser();
    
    // For now, allow any authenticated user to run migration (you can restrict this later)
    console.log(`Migration requested by: ${email}`);
    
    console.log('🚀 Starting production database migration...');
    
    // Check if Session.tutorId column exists
    try {
      await prisma.$queryRaw`SELECT "tutorId" FROM "Session" LIMIT 1`;
      console.log('✅ Session.tutorId column already exists');
    } catch (error) {
      console.log('❌ Session.tutorId column missing, adding it...');
      
      // Add the missing tutorId column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "tutorId" TEXT`;
      console.log('✅ Added Session.tutorId column');
      
      // Add index for performance
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_tutorId_idx" ON "Session"("tutorId")`;
      console.log('✅ Added index on Session.tutorId');
    }
    
    // Check if Session.connectionId column exists
    try {
      await prisma.$queryRaw`SELECT "connectionId" FROM "Session" LIMIT 1`;
      console.log('✅ Session.connectionId column already exists');
    } catch (error) {
      console.log('❌ Session.connectionId column missing, adding it...');
      
      // Add the missing connectionId column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "connectionId" TEXT`;
      console.log('✅ Added Session.connectionId column');
      
      // Add index for performance
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_connectionId_idx" ON "Session"("connectionId")`;
      console.log('✅ Added index on Session.connectionId');
    }
    
    // Check if Session.title column exists
    try {
      await prisma.$queryRaw`SELECT "title" FROM "Session" LIMIT 1`;
      console.log('✅ Session.title column already exists');
    } catch (error) {
      console.log('❌ Session.title column missing, adding it...');
      
      // Add the missing title column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "title" TEXT`;
      console.log('✅ Added Session.title column');
    }
    
    // Check if Session.location column exists
    try {
      await prisma.$queryRaw`SELECT "location" FROM "Session" LIMIT 1`;
      console.log('❌ Session.location column missing, adding it...');
      
      // Add the missing location column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "location" TEXT`;
      console.log('✅ Added Session.location column');
    } catch (error) {
      console.log('✅ Session.location column already exists');
    }
    
    // Check if Session.meetingLink column exists
    try {
      await prisma.$queryRaw`SELECT "meetingLink" FROM "Session" LIMIT 1`;
      console.log('✅ Session.meetingLink column already exists');
    } catch (error) {
      console.log('❌ Session.meetingLink column missing, adding it...');
      
      // Add the missing meetingLink column to Session table
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "meetingLink" TEXT`;
      console.log('✅ Added Session.meetingLink column');
    }
    
    console.log('✅ Schema changes applied successfully');
    console.log('✅ Migration completed!');
    
    // Verify the Tutor table structure
    const tutorCount = await prisma.tutor.count();
    console.log(`📈 Current tutor count: ${tutorCount}`);
    
    // Verify the Session table structure
    const sessionCount = await prisma.session.count();
    console.log(`📈 Current session count: ${sessionCount}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Migration completed successfully',
      tutorCount,
      sessionCount
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Migration failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Critical database migration endpoint',
    usage: 'POST with Bearer token to trigger migration',
    timestamp: new Date().toISOString(),
  });
}