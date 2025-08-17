#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');

const VALID_SUBJECTS = [
  'MATHEMATICS',
  'ENGLISH', 
  'SCIENCE',
  'PHYSICS',
  'CHEMISTRY',
  'BIOLOGY',
  'HISTORY',
  'GEOGRAPHY',
  'COMPUTER_SCIENCE',
  'PROGRAMMING',
  'LANGUAGES',
  'SPANISH',
  'FRENCH',
  'ART',
  'MUSIC',
  'ECONOMICS',
  'PSYCHOLOGY'
];

// Mapping from string values to enum values
const STRING_TO_ENUM = {
  'Mathematics': 'MATHEMATICS',
  'English': 'ENGLISH',
  'Science': 'SCIENCE', 
  'Physics': 'PHYSICS',
  'Chemistry': 'CHEMISTRY',
  'Biology': 'BIOLOGY',
  'History': 'HISTORY',
  'Geography': 'GEOGRAPHY',
  'Computer Science': 'COMPUTER_SCIENCE',
  'Programming': 'PROGRAMMING',
  'Languages': 'LANGUAGES',
  'Spanish': 'SPANISH',
  'French': 'FRENCH',
  'Art': 'ART',
  'Music': 'MUSIC',
  'Economics': 'ECONOMICS',
  'Psychology': 'PSYCHOLOGY'
};

async function migrateSubjectData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Starting subject data migration...');
    
    // 1. Handle invalid student subjects
    console.log('\n📝 Cleaning invalid student subjects...');
    const invalidStudents = await prisma.student.findMany({
      where: {
        subject: {
          notIn: Object.keys(STRING_TO_ENUM)
        }
      }
    });
    
    console.log(`Found ${invalidStudents.length} students with invalid subjects`);
    
    for (const student of invalidStudents) {
      console.log(`- Student ${student.id}: "${student.subject}" -> null (will be prompted to select)`);
      await prisma.student.update({
        where: { id: student.id },
        data: { subject: null }
      });
    }
    
    // 2. Report on data that will be converted
    console.log('\n📊 Data conversion summary:');
    
    const tutorProfiles = await prisma.tutorProfile.findMany({
      select: { id: true, subjects: true }
    });
    
    console.log(`TutorProfile records: ${tutorProfiles.length}`);
    tutorProfiles.forEach(tp => {
      const converted = tp.subjects.map(s => STRING_TO_ENUM[s] || s);
      console.log(`- Profile ${tp.id}: [${tp.subjects.join(', ')}] -> [${converted.join(', ')}]`);
    });
    
    const students = await prisma.student.findMany({
      select: { id: true, subject: true, preferredSubjects: true }
    });
    
    console.log(`\nStudent records: ${students.length}`);
    students.forEach(s => {
      if (s.subject) {
        const converted = STRING_TO_ENUM[s.subject] || s.subject;
        console.log(`- Student ${s.id} subject: "${s.subject}" -> "${converted}"`);
      }
      if (s.preferredSubjects.length > 0) {
        const converted = s.preferredSubjects.map(ps => STRING_TO_ENUM[ps] || ps);
        console.log(`- Student ${s.id} preferred: [${s.preferredSubjects.join(', ')}] -> [${converted.join(', ')}]`);
      }
    });
    
    console.log('\n✅ Data migration preparation complete!');
    console.log('\nNext steps:');
    console.log('1. Apply the Prisma schema changes with enum');
    console.log('2. The database will automatically convert string values to enum values');
    console.log('3. Invalid data has been cleaned (set to null)');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateSubjectData();
}

module.exports = { migrateSubjectData };
