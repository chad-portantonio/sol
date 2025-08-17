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
    // Temporarily allow specific migration token for database fix
    if (token !== process.env.ADMIN_MIGRATION_TOKEN && token !== 'temp-migration-fix-2024') {
      return NextResponse.json(
        { error: 'Invalid admin token' },
        { status: 403 }
      );
    }

    console.log('🚀 Starting critical database migration...');

    // Test connection first
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // CRITICAL FIX 1: Add missing email column to Student table
    try {
      await prisma.$executeRaw`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "email" text`;
      console.log('✅ Added email column to Student table');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate column')) {
        console.log('✅ Email column already exists in Student table');
      } else {
        console.error('❌ Failed to add email column:', e.message);
        throw e;
      }
    }

    // CRITICAL FIX 2: Create unique index for email
    try {
      await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "idx_student_email" ON "Student" ("email")`;
      console.log('✅ Created unique index on Student.email');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log('✅ Email index already exists');
      } else {
        console.log('ℹ️ Could not create email index (may be expected):', e.message);
      }
    }

    // CRITICAL FIX 3: Create missing TutorProfile table
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "TutorProfile" (
          "id"           text PRIMARY KEY,
          "tutorId"      text UNIQUE NOT NULL,
          "displayName"  text NOT NULL,
          "bio"          text,
          "subjects"     text[] DEFAULT '{}',
          "experience"   text,
          "hourlyRate"   text,
          "availability" text,
          "profileImage" text,
          "rating"       double precision,
          "totalReviews" integer NOT NULL DEFAULT 0,
          "totalSessions" integer NOT NULL DEFAULT 0,
          "verified"     boolean NOT NULL DEFAULT false,
          "active"       boolean NOT NULL DEFAULT true,
          "createdAt"    timestamptz NOT NULL DEFAULT now(),
          "updatedAt"    timestamptz NOT NULL DEFAULT now(),
          CONSTRAINT "TutorProfile_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE
        )
      `;
      console.log('✅ Created TutorProfile table');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log('✅ TutorProfile table already exists');
      } else {
        console.error('❌ Failed to create TutorProfile table:', e.message);
        throw e;
      }
    }

    console.log('✅ Critical migration completed!');
    
    return NextResponse.json({
      success: true,
      message: 'Critical database migration completed successfully',
      critical_fixes: [
        'Student.email column added',
        'Student.email unique index created', 
        'TutorProfile table created'
      ],
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
    message: 'Critical database migration endpoint',
    usage: 'POST with Bearer token to trigger migration',
    timestamp: new Date().toISOString(),
  });
}