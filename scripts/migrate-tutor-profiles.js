const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateTutorProfiles() {
  console.log('🚀 Starting tutor profile migration...');

  try {
    // Get all tutors without profiles
    const tutorsWithoutProfiles = await prisma.tutor.findMany({
      where: {
        profile: null
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });

    console.log(`📊 Found ${tutorsWithoutProfiles.length} tutors without profiles`);

    if (tutorsWithoutProfiles.length === 0) {
      console.log('✅ All tutors already have profiles');
      return;
    }

    // Create basic profiles for each tutor
    for (const tutor of tutorsWithoutProfiles) {
      try {
        const displayName = tutor.email.split('@')[0];
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName.toLowerCase().replace(/[^a-z0-9]/g, '')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
        
        await prisma.tutorProfile.create({
          data: {
            tutorId: tutor.id,
            displayName: displayName.charAt(0).toUpperCase() + displayName.slice(1),
            subjects: ['Mathematics'], // Default subject
            profileImage: avatarUrl, // Cartoon avatar instead of placeholder
            country: 'Jamaica', // Default country
            city: 'Kingston', // Default city
            bio: 'New tutor - profile setup in progress',
            experience: '',
            hourlyRate: '',
            availability: '',
            address: '',
            active: true,
            verified: false,
            rating: null,
            totalReviews: 0,
            totalSessions: 0
          }
        });

        console.log(`✅ Created profile for tutor: ${tutor.email}`);
      } catch (error) {
        console.error(`❌ Failed to create profile for tutor ${tutor.email}:`, error.message);
      }
    }

    // Skip the update section for now - all new profiles are created with required fields
    console.log('📊 Skipping profile updates - all new profiles have required fields');

    console.log('🎉 Tutor profile migration completed successfully!');

    // Show final stats
    const totalTutors = await prisma.tutor.count();
    const totalProfiles = await prisma.tutorProfile.count();
    const activeProfiles = await prisma.tutorProfile.count({ where: { active: true } });

    console.log('\n📈 Final Statistics:');
    console.log(`Total Tutors: ${totalTutors}`);
    console.log(`Total Profiles: ${totalProfiles}`);
    console.log(`Active Profiles: ${activeProfiles}`);
    console.log(`Profiles with Subjects: ${await prisma.tutorProfile.count({ where: { subjects: { isEmpty: false } } })}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateTutorProfiles()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateTutorProfiles };
