import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all sessions in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const upcomingSessions = await prisma.session.findMany({
      where: {
        startTime: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
      },
      include: {
        student: {
          include: {
            tutor: true,
          },
        },
      },
    });

    let remindersSent = 0;
    let errors = 0;

    // Send reminders for each session
    for (const session of upcomingSessions) {
      try {
        // For now, we'll send reminders for all sessions
        // In production, you might want to track this in a separate table
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email/send-reminder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: session.id }),
        });

        if (response.ok) {
          remindersSent++;
          console.log(`Reminder sent for session ${session.id} (${session.student.fullName})`);
        } else {
          errors++;
          console.error(`Failed to send reminder for session ${session.id}`);
        }
      } catch (error) {
        errors++;
        console.error(`Error processing session ${session.id}:`, error);
      }
    }

    return NextResponse.json({
      message: 'Cron job completed',
      remindersSent,
      errors,
      totalSessions: upcomingSessions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

// Also allow GET for testing
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: 'Cron endpoint is working',
    timestamp: new Date().toISOString(),
  });
}
