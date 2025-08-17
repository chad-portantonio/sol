import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSessionSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subject: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  notes: z.string().optional(),
  homework: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireUser();
    const body = await request.json();
    const validatedData = createSessionSchema.parse(body);

    // Validate that end time is after start time
    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);
    
    if (endTime <= startTime) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    // Verify the student belongs to the authenticated tutor
    const student = await prisma.student.findFirst({
      where: {
        id: validatedData.studentId,
        tutor: { userId },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    const session = await prisma.session.create({
      data: ({
        studentId: validatedData.studentId,
        startTime,
        endTime,
        subject: validatedData.subject ?? 'General', // Always provide subject with default
        notes: validatedData.notes ?? null,
        homework: validatedData.homework ?? null,
      }) as unknown as Prisma.SessionUncheckedCreateInput,
      include: {
        student: {
          select: {
            fullName: true,
            parentEmail: true,
          },
        },
      },
    });

    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireUser();
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Verify the student belongs to the authenticated tutor
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        tutor: { userId },
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get sessions for the student
    const sessions = await prisma.session.findMany({
      where: { studentId },
      orderBy: { startTime: 'desc' },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

