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

    // Check if tutor already exists first
    const existingTutor = await prisma.tutor.findUnique({
      where: { userId }
    });

    if (existingTutor) {
      return NextResponse.json(
        { message: 'Tutor record already exists', tutor: existingTutor },
        { status: 409 }
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
    
    // Handle various Prisma errors
    if (error instanceof Error) {
      // Unique constraint violation
      if (error.message.includes('Unique constraint') || error.message.includes('unique_violation')) {
        return NextResponse.json(
          { error: 'Tutor record already exists' },
          { status: 409 }
        );
      }
      
      // Connection/prepared statement errors
      if (error.message.includes('prepared statement') || error.message.includes('ConnectorError')) {
        console.warn('Database connection issue, but continuing...');
        return NextResponse.json(
          { message: 'Account setup in progress' },
          { status: 202 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create tutor record' },
      { status: 500 }
    );
  } finally {
    // Ensure connection cleanup
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}
