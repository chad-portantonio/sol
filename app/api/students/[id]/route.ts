import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
// Import the limit directly since the module import has issues
const STUDENT_ACTIVE_LIMIT = 20;
import { z } from 'zod';
import { Student } from '@/lib/types';

const updateStudentSchema = z.object({
  fullName: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  year: z.string().min(1).optional(),
  active: z.boolean().optional(),
  parentEmail: z.string().email().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser();
    const { id } = await params;
    
    const student = await prisma.student.findFirst({
      where: {
        id,
        tutor: { userId },
      },
      include: {
        sessions: {
          orderBy: { startTime: 'desc' },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateStudentSchema.parse(body);

    // If toggling active status, check the limit
    if (validatedData.active === true) {
      const tutor = await prisma.tutor.findUnique({
        where: { userId },
        include: { students: true }
      });

      if (tutor) {
        const activeStudents = tutor.students.filter(
          (student: Student) => student.active && student.id !== id
        );
        if (activeStudents.length >= STUDENT_ACTIVE_LIMIT) {
          return NextResponse.json(
            { error: `Cannot exceed ${STUDENT_ACTIVE_LIMIT} active students` },
            { status: 400 }
          );
        }
      }
    }

    const student = await prisma.student.updateMany({
      where: {
        id,
        tutor: { userId },
      },
      data: validatedData,
    });

    if (student.count === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Fetch the updated student
    const updatedStudent = await prisma.student.findUnique({
      where: { id },
    });

    return NextResponse.json({ student: updatedStudent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser();
    const { id } = await params;
    
    const student = await prisma.student.deleteMany({
      where: {
        id,
        tutor: { userId },
      },
    });

    if (student.count === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
