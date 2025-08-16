import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, role, studentId } = await request.json();

    if (!userId || !email || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === 'parent' && !studentId) {
      return NextResponse.json(
        { error: 'Student ID is required for parent accounts' },
        { status: 400 }
      );
    }

    if (role === 'parent') {
      // For parents, verify the student exists and create a parent record
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { tutor: true }
      });

      if (!student) {
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }

      // Create parent record linked to the student
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parent = await (prisma as any).parent.create({
        data: {
          userId,
          email,
          fullName,
          studentId,
        },
      });

      return NextResponse.json({ 
        message: 'Parent account created successfully',
        parent 
      });
    } else {
      // For students, create a student record
      // Generate a unique parent link token using crypto
      const parentLinkToken = randomBytes(32).toString('hex');
      
      const student = await prisma.student.create({
        data: {
          fullName,
          subject: 'General', // Default subject, can be updated later
          year: 'Not specified', // Default year, can be updated later
          active: true,
          parentEmail: email, // Students can have their own email
          parentLinkToken, // Required unique field
                  } as Prisma.StudentCreateInput, // Type assertion for optional tutor relation
      });

      return NextResponse.json({ 
        message: 'Student account created successfully',
        student: {
          ...student,
          userId // Include the userId in the response for reference
        }
      });
    }
  } catch (error) {
    console.error('Error creating student/parent account:', error);
    
    // Check if it's a duplicate key error
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Account already exists' },
        { status: 409 }
      );
    }

    // Return more specific error information for debugging
    return NextResponse.json(
      { 
        error: 'Failed to create account',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
