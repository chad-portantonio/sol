import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the tutor record
    const tutor = await prisma.tutor.create({
      data: {
        userId,
        email,
      },
    });

    return NextResponse.json({ 
      message: 'Tutor record created successfully',
      tutor 
    });
  } catch (error) {
    console.error('Error creating tutor record:', error);
    
    // Check if it's a duplicate key error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Tutor record already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create tutor record' },
      { status: 500 }
    );
  }
}
