#!/usr/bin/env node

/**
 * Data Migration Script: Convert One-to-Many to Many-to-Many Relationships
 * 
 * This script migrates existing tutor-student relationships to the new
 * many-to-many structure while preserving all existing data.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateData() {
  console.log('🚀 Starting migration to many-to-many relationships...');

  try {
    // Step 1: Migrate existing tutor-student relationships
    console.log('📋 Step 1: Migrating existing tutor-student relationships...');
    
    const studentsWithTutors = await prisma.student.findMany({
      where: {
        tutorId: {
          not: null
        }
      },
      include: {
        tutor: true
      }
    });

    console.log(`Found ${studentsWithTutors.length} students with existing tutor relationships`);

    // Create TutorStudent records for existing relationships
    for (const student of studentsWithTutors) {
      const tutorStudent = await prisma.tutorStudent.create({
        data: {
          tutorId: student.tutorId,
          studentId: student.id,
          subject: student.subject, // Use the student's subject as the relationship subject
          startDate: student.createdAt, // Use student creation date as start date
          active: student.active,
          notes: `Migrated from original tutor-student relationship`
        }
      });

      console.log(`✅ Created TutorStudent relationship: ${student.fullName} -> ${student.tutor.email}`);
    }

    // Step 2: Migrate sessions to use TutorStudent relationships
    console.log('📋 Step 2: Migrating sessions to use TutorStudent relationships...');
    
    const sessions = await prisma.session.findMany({
      include: {
        student: {
          include: {
            tutorStudents: true
          }
        }
      }
    });

    console.log(`Found ${sessions.length} sessions to migrate`);

    for (const session of sessions) {
      if (session.student.tutorStudents.length > 0) {
        // Use the first (primary) tutor-student relationship
        const primaryTutorStudent = session.student.tutorStudents[0];
        
        await prisma.session.update({
          where: { id: session.id },
          data: {
            tutorStudentId: primaryTutorStudent.id,
            tutorId: primaryTutorStudent.tutorId
          }
        });

        console.log(`✅ Updated session ${session.id} with TutorStudent relationship`);
      }
    }

    // Step 3: Create default tutor subjects based on existing students
    console.log('📋 Step 3: Creating default tutor subjects...');
    
    const tutorsWithSubjects = await prisma.tutor.findMany({
      include: {
        tutorStudents: {
          select: {
            subject: true
          },
          distinct: ['subject']
        }
      }
    });

    for (const tutor of tutorsWithSubjects) {
      const subjects = [...new Set(tutor.tutorStudents.map(ts => ts.subject).filter(Boolean))];
      
      for (const subject of subjects) {
        await prisma.tutorSubject.upsert({
          where: {
            tutorId_subject: {
              tutorId: tutor.id,
              subject: subject
            }
          },
          create: {
            tutorId: tutor.id,
            subject: subject,
            level: 'intermediate' // Default level
          },
          update: {} // Do nothing if it already exists
        });

        console.log(`✅ Created TutorSubject: ${tutor.email} -> ${subject}`);
      }
    }

    // Step 4: Add foreign key constraints to sessions (commented out for safety)
    console.log('📋 Step 4: Adding foreign key constraints...');
    console.log('⚠️  Foreign key constraints should be added manually after verifying data integrity');
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`- TutorStudent relationships created: ${studentsWithTutors.length}`);
    console.log(`- Sessions updated: ${sessions.length}`);
    console.log(`- Tutors processed: ${tutorsWithSubjects.length}`);

    // Verification queries
    console.log('\n🔍 Verification:');
    const tutorStudentCount = await prisma.tutorStudent.count();
    const updatedSessionCount = await prisma.session.count({
      where: {
        tutorStudentId: {
          not: null
        }
      }
    });
    const tutorSubjectCount = await prisma.tutorSubject.count();

    console.log(`- Total TutorStudent records: ${tutorStudentCount}`);
    console.log(`- Sessions with TutorStudent links: ${updatedSessionCount}`);
    console.log(`- TutorSubject records: ${tutorSubjectCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function rollback() {
  console.log('🔄 Rolling back migration...');
  
  try {
    // Remove foreign key constraints first (if they were added)
    console.log('Removing foreign key constraints...');
    
    // Clear migrated data
    await prisma.tutorSubject.deleteMany({});
    await prisma.session.updateMany({
      data: {
        tutorStudentId: null,
        tutorId: null
      }
    });
    await prisma.tutorStudent.deleteMany({});
    
    console.log('✅ Rollback completed');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Command line interface
const command = process.argv[2];

if (command === 'migrate') {
  migrateData();
} else if (command === 'rollback') {
  rollback();
} else {
  console.log('Usage:');
  console.log('  node migrate-to-many-to-many.js migrate   - Run the migration');
  console.log('  node migrate-to-many-to-many.js rollback  - Rollback the migration');
}
