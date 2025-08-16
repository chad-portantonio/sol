import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const { userId, email } = await requireUser();

    // Upsert Tutor record
    const tutor = await prisma.tutor.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        email,
      },
    });

    return NextResponse.json({ tutor });
  } catch (error) {
    console.error('Error ensuring tutor:', error);
    return NextResponse.json(
      { error: 'Failed to ensure tutor record' },
      { status: 500 }
    );
  }
}

