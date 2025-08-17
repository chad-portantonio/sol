/**
 * Seed script to populate Subject and GradeLevel tables
 * with data that's currently hardcoded in the UI
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Subjects currently hardcoded in browse-tutors/page.tsx and student-sign-up
const subjects = [
  { name: 'Mathematics', category: 'STEM' },
  { name: 'English', category: 'Languages' },
  { name: 'Science', category: 'STEM' },
  { name: 'Physics', category: 'STEM' },
  { name: 'Chemistry', category: 'STEM' },
  { name: 'Biology', category: 'STEM' },
  { name: 'History', category: 'Social Studies' },
  { name: 'Geography', category: 'Social Studies' },
  { name: 'Computer Science', category: 'STEM' },
  { name: 'Programming', category: 'STEM' },
  { name: 'Languages', category: 'Languages' },
  { name: 'Spanish', category: 'Languages' },
  { name: 'French', category: 'Languages' },
  { name: 'Art', category: 'Arts' },
  { name: 'Music', category: 'Arts' },
  { name: 'Economics', category: 'Social Studies' },
  { name: 'Psychology', category: 'Social Studies' },
];

// Caribbean-specific grade levels (currently hardcoded in student-sign-up)
const gradeLevels = [
  // Primary Education (Ages 5-11)
  { name: 'Grade 1', category: 'PRIMARY', sequence: 1 },
  { name: 'Grade 2', category: 'PRIMARY', sequence: 2 },
  { name: 'Grade 3', category: 'PRIMARY', sequence: 3 },
  { name: 'Grade 4', category: 'PRIMARY', sequence: 4 },
  { name: 'Grade 5', category: 'PRIMARY', sequence: 5 },
  { name: 'Grade 6', category: 'PRIMARY', sequence: 6 },
  
  // Secondary Education (Ages 11-16)
  { name: 'Grade 7', category: 'SECONDARY', sequence: 7 },
  { name: 'Grade 8', category: 'SECONDARY', sequence: 8 },
  { name: 'Grade 9', category: 'SECONDARY', sequence: 9 },
  { name: 'Grade 10', category: 'SECONDARY', sequence: 10 },
  { name: 'Grade 11 (CSEC)', category: 'SECONDARY', sequence: 11 },
  
  // Alternative Caribbean naming
  { name: 'Form 1', category: 'SECONDARY', sequence: 7 },
  { name: 'Form 2', category: 'SECONDARY', sequence: 8 },
  { name: 'Form 3', category: 'SECONDARY', sequence: 9 },
  { name: 'Form 4', category: 'SECONDARY', sequence: 10 },
  { name: 'Form 5', category: 'SECONDARY', sequence: 11 },
  
  // Sixth Form / Pre-University (Ages 16-18)
  { name: 'Lower Sixth (CAPE 1)', category: 'SIXTH_FORM', sequence: 12 },
  { name: 'Upper Sixth (CAPE 2)', category: 'SIXTH_FORM', sequence: 13 },
  { name: 'Grade 12', category: 'SIXTH_FORM', sequence: 12 },
  { name: 'Grade 13', category: 'SIXTH_FORM', sequence: 13 },
  
  // University
  { name: 'University Year 1', category: 'UNIVERSITY', sequence: 14 },
  { name: 'University Year 2', category: 'UNIVERSITY', sequence: 15 },
  { name: 'University Year 3', category: 'UNIVERSITY', sequence: 16 },
  { name: 'University Year 4', category: 'UNIVERSITY', sequence: 17 },
  { name: 'Graduate/Postgraduate', category: 'UNIVERSITY', sequence: 18 },
];

async function main() {
  console.log('🌱 Seeding database with subjects and grade levels...');

  // Seed subjects
  console.log('📚 Creating subjects...');
  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { name: subject.name },
      update: { category: subject.category },
      create: {
        name: subject.name,
        category: subject.category,
        active: true,
      },
    });
  }
  console.log(`✅ Created ${subjects.length} subjects`);

  // Seed grade levels
  console.log('🎓 Creating grade levels...');
  for (const grade of gradeLevels) {
    await prisma.gradeLevel.upsert({
      where: { name: grade.name },
      update: { 
        category: grade.category, 
        sequence: grade.sequence 
      },
      create: {
        name: grade.name,
        category: grade.category,
        sequence: grade.sequence,
        active: true,
      },
    });
  }
  console.log(`✅ Created ${gradeLevels.length} grade levels`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
