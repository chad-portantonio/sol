import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// Import the limit directly since the module import isn't working
const STUDENT_ACTIVE_LIMIT = 20;
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { Student } from '@/lib/types';

const createStudentSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  subject: z.string().min(1, 'Subject is required'),
  year: z.string().min(1, 'Year is required'),
  parentEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser();
    
    // Get the tutor
    const tutor = await prisma.tutor.findUnique({
      where: { userId },
      include: { students: true }
    });

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Check active student limit
    const activeStudents = tutor.students.filter((student: Student) => student.active);
    if (activeStudents.length >= STUDENT_ACTIVE_LIMIT) {
      return NextResponse.json(
        { error: `Cannot exceed ${STUDENT_ACTIVE_LIMIT} active students` },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = createStudentSchema.parse(body);

    // Generate unique parent link token
    const parentLinkToken = nanoid(24);

    const student = await prisma.student.create({
      data: {
        ...validatedData,
        tutorId: tutor.id,
        parentLinkToken,
      },
    });

    return NextResponse.json({ student });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId } = await requireUser();
    
    const tutor = await prisma.tutor.findUnique({
      where: { userId },
      include: {
        students: {
          include: {
            sessions: {
              orderBy: { startTime: 'desc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ students: tutor.students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
