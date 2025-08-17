import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Get a single tutor's profile by their Supabase user ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    const { tutorId } = await params;

    if (!tutorId) {
      return NextResponse.json(
        { error: 'Tutor ID is required' },
        { status: 400 }
      );
    }

    // First find the tutor record
    const tutor = await prisma.tutor.findUnique({
      where: { userId: tutorId },
      include: {
        profile: true
      }
    });

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Return the profile if it exists, or null if it doesn't
    return NextResponse.json({
      tutor: {
        id: tutor.id,
        userId: tutor.userId,
        email: tutor.email,
        createdAt: tutor.createdAt
      },
      profile: tutor.profile
    });

  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutor profile' },
      { status: 500 }
    );
  }
}
