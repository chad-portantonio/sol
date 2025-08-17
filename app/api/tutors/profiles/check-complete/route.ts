import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');

    if (!tutorId) {
      return NextResponse.json(
        { error: 'Tutor ID is required' },
        { status: 400 }
      );
    }

    // Get the tutor profile
    const profile = await prisma.tutorProfile.findUnique({
      where: { tutorId },
      select: {
        displayName: true,
        subjects: true,
        profileImage: true,
        country: true,
        city: true,
        bio: true,
        experience: true,
        hourlyRate: true,
        availability: true
      }
    });

    if (!profile) {
      return NextResponse.json({ isComplete: false });
    }

    // Check if profile has all required fields and meaningful content
    const isComplete = !!(
      profile.displayName &&
      profile.subjects.length > 0 &&
      profile.profileImage &&
      profile.country &&
      profile.city &&
      profile.bio &&
      profile.bio.length > 20 && // Bio should have some content
      profile.experience &&
      profile.experience.length > 10 && // Experience should have some content
      profile.hourlyRate &&
      profile.availability &&
      profile.availability.length > 10 // Availability should have some content
    );

    return NextResponse.json({ isComplete });
  } catch (error) {
    console.error('Error checking tutor profile completeness:', error);
    return NextResponse.json(
      { error: 'Failed to check profile completeness' },
      { status: 500 }
    );
  }
}
