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

    // Add phone columns (idempotent)
    await prisma.$executeRawUnsafe(`ALTER TABLE "Tutor"   ADD COLUMN IF NOT EXISTS "phone" text;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "phone" text;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Parent"  ADD COLUMN IF NOT EXISTS "phone" text;`);

    // CRITICAL: Add missing email column to Student table
    await prisma.$executeRawUnsafe(`ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "email" text;`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "idx_student_email" ON "Student" ("email");`);

    // CRITICAL: Create missing TutorProfile table
    await prisma.$executeRawUnsafe(`
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
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_tutorid" ON "TutorProfile" ("tutorId");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_subjects" ON "TutorProfile" ("subjects");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_active" ON "TutorProfile" ("active");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_verified" ON "TutorProfile" ("verified");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_tutorprofile_rating" ON "TutorProfile" ("rating");`);

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
      message: 'Database migration completed successfully',
      tables: ['Student (added email)', 'TutorProfile', 'Subject', 'GradeLevel'],
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
