import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Get all tutor profiles for browsing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12'))); // Limit between 1-50
    const skip = (page - 1) * limit;

    // Build where clause
    const where: { active: boolean; subjects?: { hasSome: string[] } } = {
      active: true,
    };

    if (subject) {
      where.subjects = {
        hasSome: [subject]
      };
    }

    // Get tutors with their profiles (with retry logic)
    let tutorProfiles: Prisma.TutorProfileGetPayload<{
      include: { tutor: { select: { id: true; email: true; createdAt: true } } }
    }>[] = [];
    let totalCount = 0;
    
    for (let retryCount = 0; retryCount < 3; retryCount++) {
      try {
        [tutorProfiles, totalCount] = await Promise.all([
          prisma.tutorProfile.findMany({
            where,
            include: {
              tutor: {
                select: {
                  id: true,
                  email: true,
                  createdAt: true
                }
              }
            },
            orderBy: [
              { verified: 'desc' }, // Verified tutors first
              { rating: 'desc' },   // Then by rating
              { totalSessions: 'desc' }, // Then by experience
              { createdAt: 'desc' } // Finally by newest
            ],
            skip,
            take: limit
          }),
          prisma.tutorProfile.count({ where })
        ]);
        break; // Success, exit retry loop
      } catch (dbError) {
        console.error(`Database query attempt ${retryCount + 1} failed:`, dbError);
        if (retryCount === 2) throw dbError; // Last attempt, re-throw error
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      }
    }
    
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      tutors: tutorProfiles,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching tutor profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tutor profiles' },
      { status: 500 }
    );
  }
}

// Create or update tutor profile
export async function POST(request: NextRequest) {
  try {
    const { 
      tutorId, 
      displayName, 
      bio, 
      subjects, 
      experience, 
      hourlyRate, 
      availability,
      profileImage 
    } = await request.json();

    if (!tutorId || !displayName || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: tutorId, displayName, and subjects are required' },
        { status: 400 }
      );
    }

    // Check if tutor exists
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId }
    });

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Upsert the tutor profile
    const tutorProfile = await prisma.tutorProfile.upsert({
      where: { tutorId },
      update: {
        displayName,
        bio: bio || null,
        subjects,
        experience: experience || null,
        hourlyRate: hourlyRate || null,
        availability: availability || null,
        profileImage: profileImage || null,
      },
      create: {
        tutorId,
        displayName,
        bio: bio || null,
        subjects,
        experience: experience || null,
        hourlyRate: hourlyRate || null,
        availability: availability || null,
        profileImage: profileImage || null,
      },
      include: {
        tutor: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Tutor profile saved successfully',
      profile: tutorProfile
    });
  } catch (error) {
    console.error('Error saving tutor profile:', error);
    return NextResponse.json(
      { error: 'Failed to save tutor profile' },
      { status: 500 }
    );
  }
}
