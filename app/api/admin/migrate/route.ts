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
    
    // Check if Session.subject column exists
    try {
      await prisma.$queryRaw`SELECT "subject" FROM "Session" LIMIT 1`;
      console.log('✅ Session.subject column already exists');
    } catch (error) {
      console.log('❌ Session.subject column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "subject" TEXT NOT NULL DEFAULT 'General'`;
      console.log('✅ Session.subject column added');
    }
    
    // Check if Session.tutorId column exists
    try {
      await prisma.$queryRaw`SELECT "tutorId" FROM "Session" LIMIT 1`;
      console.log('✅ Session.tutorId column already exists');
    } catch (error) {
      console.log('❌ Session.tutorId column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "tutorId" TEXT`;
      console.log('✅ Session.tutorId column added');
    }
    
    // Check if Session.connectionId column exists
    try {
      await prisma.$queryRaw`SELECT "connectionId" FROM "Session" LIMIT 1`;
      console.log('✅ Session.connectionId column already exists');
    } catch (error) {
      console.log('❌ Session.connectionId column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "connectionId" TEXT`;
      console.log('✅ Session.connectionId column added');
    }
    
    // Check if Session.title column exists
    try {
      await prisma.$queryRaw`SELECT "title" FROM "Session" LIMIT 1`;
      console.log('✅ Session.title column already exists');
    } catch (error) {
      console.log('❌ Session.title column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "title" TEXT`;
      console.log('✅ Session.title column added');
    }
    
    // Check if Session.notes column exists
    try {
      await prisma.$queryRaw`SELECT "notes" FROM "Session" LIMIT 1`;
      console.log('✅ Session.notes column already exists');
    } catch (error) {
      console.log('❌ Session.notes column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "notes" TEXT`;
      console.log('✅ Session.notes column added');
    }
    
    // Check if Session.homework column exists
    try {
      await prisma.$queryRaw`SELECT "homework" FROM "Session" LIMIT 1`;
      console.log('✅ Session.homework column already exists');
    } catch (error) {
      console.log('❌ Session.homework column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "homework" TEXT`;
      console.log('✅ Session.homework column added');
    }
    
    // Check if Session.location column exists
    try {
      await prisma.$queryRaw`SELECT "location" FROM "Session" LIMIT 1`;
      console.log('✅ Session.location column already exists');
    } catch (error) {
      console.log('❌ Session.location column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "location" TEXT`;
      console.log('✅ Session.location column added');
    }
    
    // Check if Session.meetingLink column exists
    try {
      await prisma.$queryRaw`SELECT "meetingLink" FROM "Session" LIMIT 1`;
      console.log('✅ Session.meetingLink column already exists');
    } catch (error) {
      console.log('❌ Session.meetingLink column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "meetingLink" TEXT`;
      console.log('✅ Session.meetingLink column added');
    }
    
    // Check if Session.status column exists
    try {
      await prisma.$queryRaw`SELECT "status" FROM "Session" LIMIT 1`;
      console.log('✅ Session.status column already exists');
    } catch (error) {
      console.log('❌ Session.status column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'scheduled'`;
      console.log('✅ Session.status column added');
    }
    
    // Check if Session.endTime column exists
    try {
      await prisma.$queryRaw`SELECT "endTime" FROM "Session" LIMIT 1`;
      console.log('✅ Session.endTime column already exists');
    } catch (error) {
      console.log('❌ Session.endTime column missing - adding it now...');
      await prisma.$executeRaw`ALTER TABLE "Session" ADD COLUMN "endTime" TIMESTAMP`;
      console.log('✅ Session.endTime column added');
    }
    
    // Add indexes for performance
    console.log('🔍 Adding database indexes...');
    
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_tutorId_idx" ON "Session"("tutorId")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_connectionId_idx" ON "Session"("connectionId")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_startTime_idx" ON "Session"("startTime")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_status_idx" ON "Session"("status")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "Session_subject_idx" ON "Session"("subject")`;
      console.log('✅ Database indexes added');
    } catch (error) {
      console.log('⚠️ Some indexes may already exist:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    console.log('🎉 Production database migration completed successfully!');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database migration completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Critical database migration endpoint',
    usage: 'POST with Bearer token to trigger migration',
    timestamp: new Date().toISOString(),
  });
}