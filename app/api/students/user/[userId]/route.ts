import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if it's a tutor
    const tutor = await prisma.tutor.findUnique({
      where: { userId }
    });

    if (tutor) {
      return NextResponse.json({
        id: tutor.id,
        userId: tutor.userId,
        email: tutor.email,
        role: 'tutor'
      });
    }

    // In the current schema, we don't have a separate User table or Parent table
    // Students and parents access the system through Supabase auth but don't have 
    // corresponding database records until a tutor creates them
    
    // For now, we'll return a generic student role for non-tutor users
    // This indicates they need to be linked by a tutor
    return NextResponse.json({
      role: 'student',
      message: 'Student account needs to be linked by tutor'
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
