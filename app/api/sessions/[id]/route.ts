import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSessionSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  notes: z.string().optional(),
  homework: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSessionSchema.parse(body);

    // If updating times, validate that end time is after start time
    if (validatedData.startTime && validatedData.endTime) {
      const startTime = new Date(validatedData.startTime);
      const endTime = new Date(validatedData.endTime);
      
      if (endTime <= startTime) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        );
      }
    }

    // Verify the session belongs to a student of the authenticated tutor
    const session = await prisma.session.findFirst({
      where: {
        id,
        student: {
          tutor: { userId },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update the session
    const updatedSession = await prisma.session.update({
      where: { id },
      data: validatedData,
      include: {
        student: {
          select: {
            fullName: true,
            parentEmail: true,
          },
        },
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
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

    // Verify the session belongs to a student of the authenticated tutor
    const session = await prisma.session.findFirst({
      where: {
        id,
        student: {
          tutor: { userId },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Delete the session
    await prisma.session.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}

