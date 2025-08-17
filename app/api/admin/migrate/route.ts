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

    console.log('🚀 Starting production database migration...');

    // Test connection first
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // CRITICAL: Add missing email column to Student table first
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

    // Create unique index for email
    try {
      await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "idx_student_email" ON "Student" ("email")`;
      console.log('✅ Created unique index on Student.email');
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        console.log('✅ Email index already exists');
      } else {
        console.error('❌ Failed to create email index:', e.message);
      }
    }

    // CRITICAL: Create missing TutorProfile table
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

    // Create indexes for TutorProfile
    try {
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_tutorid" ON "TutorProfile" ("tutorId")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_subjects" ON "TutorProfile" ("subjects")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_active" ON "TutorProfile" ("active")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_verified" ON "TutorProfile" ("verified")`;
      await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_rating" ON "TutorProfile" ("rating")`;
      console.log('✅ Created TutorProfile indexes');
    } catch (e: any) {
      console.log('ℹ️ Some TutorProfile indexes may already exist:', e.message);
    }

    // Subject table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Subject" (
        "id"        text PRIMARY KEY,
        "name"      text UNIQUE NOT NULL,
        "category"  text,
        "description" text,
        "active"    boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_subject_active"   ON "Subject" ("active");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_subject_category" ON "Subject" ("category");`);

    // GradeLevel table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GradeLevel" (
        "id"        text PRIMARY KEY,
        "name"      text UNIQUE NOT NULL,
        "category"  text NOT NULL,
        "sequence"  integer UNIQUE NOT NULL,
        "description" text,
        "active"    boolean NOT NULL DEFAULT true,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_gradelevel_category" ON "GradeLevel" ("category");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_gradelevel_sequence" ON "GradeLevel" ("sequence");`);

    console.log('✅ Migration completed!');
    
    return NextResponse.json({
      success: true,
      message: 'Critical database migration completed successfully',
      critical_fixes: ['Student.email column added', 'TutorProfile table created'],
      additional_tables: ['Subject', 'GradeLevel'],
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
