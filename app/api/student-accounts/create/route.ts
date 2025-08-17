import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, fullName, preferredSubjects, gradeLevel, bio, role, studentId, tutorId } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields: email and fullName are required' },
        { status: 400 }
      );
    }

    // Handle parent account creation (legacy flow)
    if (role === 'parent') {
      if (!studentId) {
        return NextResponse.json(
          { error: 'Student ID is required for parent accounts' },
          { status: 400 }
        );
      }

      // Verify the student exists
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
      const parent = await prisma.parent.create({
        data: {
          userId: userId || '',
          email,
          fullName,
          studentId,
        },
      });

      return NextResponse.json({ 
        message: 'Parent account created successfully',
        parent 
      });
    }

    // Check if student account already exists
    const existingByUserId = userId ? await prisma.student.findUnique({
      where: { userId }
    }) : null;
    
    const existingByEmail = await prisma.student.findUnique({
      where: { email }
    });

    if (existingByUserId || existingByEmail) {
      return NextResponse.json(
        { message: 'Student account already exists', student: existingByUserId || existingByEmail },
        { status: 409 }
      );
    }

    // Validate preferredSubjects array
    const subjects = Array.isArray(preferredSubjects) ? preferredSubjects : [];

    // Create the unified student account
    const studentData: {
      email: string;
      fullName: string;
      preferredSubjects: string[];
      gradeLevel: string | null;
      bio: string | null;
      active: boolean;
      userId?: string;
      tutorId?: string;
      subject?: string;
      year?: string;
      parentEmail?: string;
      parentLinkToken?: string;
    } = {
      email,
      fullName,
      preferredSubjects: subjects,
      gradeLevel: gradeLevel || null,
      bio: bio || null,
      active: true,
    };

    // Add userId if provided (independent students)
    if (userId) {
      studentData.userId = userId;
    }

    // Add legacy fields for tutor-created students
    if (tutorId) {
      studentData.tutorId = tutorId;
      studentData.subject = subjects[0] || 'General';
      studentData.year = gradeLevel || 'Not specified';
      studentData.parentEmail = email;
      studentData.parentLinkToken = randomBytes(32).toString('hex');
    }

    const student = await prisma.student.create({
      data: studentData,
      include: {
        tutor: tutorId ? true : false,
        tutorConnections: {
          include: {
            tutor: {
              include: {
                profile: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Student account created successfully',
      student
    });
  } catch (error) {
    console.error('Error creating student account:', error);
    
    // Handle various Prisma errors
    if (error instanceof Error) {
      // Unique constraint violation
      if (error.message.includes('Unique constraint') || error.message.includes('unique_violation')) {
        return NextResponse.json(
          { error: 'Student account already exists' },
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
      { error: 'Failed to create student account' },
      { status: 500 }
    );
  } finally {
    // Ensure connection cleanup
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}
