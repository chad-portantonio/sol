-- Migration: Create Many-to-Many Tutor-Student Relationships
-- This migration creates the enhanced schema with many-to-many relationships

-- Step 1: Create the TutorStudent junction table
CREATE TABLE "TutorStudent" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorStudent_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create TutorSubject table for specializations
CREATE TABLE "TutorSubject" (
    "id" TEXT NOT NULL,
    "tutorId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TutorSubject_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add new columns to Session table for enhanced relationships
ALTER TABLE "Session" ADD COLUMN "tutorStudentId" TEXT;
ALTER TABLE "Session" ADD COLUMN "tutorId" TEXT;

-- Step 4: Create indexes for performance
CREATE UNIQUE INDEX "TutorStudent_tutorId_studentId_key" ON "TutorStudent"("tutorId", "studentId");
CREATE INDEX "TutorStudent_tutorId_idx" ON "TutorStudent"("tutorId");
CREATE INDEX "TutorStudent_studentId_idx" ON "TutorStudent"("studentId");
CREATE INDEX "TutorStudent_active_idx" ON "TutorStudent"("active");

CREATE UNIQUE INDEX "TutorSubject_tutorId_subject_key" ON "TutorSubject"("tutorId", "subject");
CREATE INDEX "TutorSubject_tutorId_idx" ON "TutorSubject"("tutorId");
CREATE INDEX "TutorSubject_subject_idx" ON "TutorSubject"("subject");

CREATE INDEX "Session_tutorStudentId_startTime_idx" ON "Session"("tutorStudentId", "startTime");
CREATE INDEX "Session_tutorId_startTime_idx" ON "Session"("tutorId", "startTime");

-- Step 5: Add foreign key constraints
ALTER TABLE "TutorStudent" ADD CONSTRAINT "TutorStudent_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TutorStudent" ADD CONSTRAINT "TutorStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TutorSubject" ADD CONSTRAINT "TutorSubject_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Step 6: Update Session foreign keys (will be done after data migration)
-- ALTER TABLE "Session" ADD CONSTRAINT "Session_tutorStudentId_fkey" FOREIGN KEY ("tutorStudentId") REFERENCES "TutorStudent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "Session" ADD CONSTRAINT "Session_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "Tutor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
