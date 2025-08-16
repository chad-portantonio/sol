import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { formatDate, formatTime, isInNext24Hours } from '@/lib/time';

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SessionWithStudentAndTutor {
  id: string;
  startTime: Date;
  endTime: Date;
  student: {
    fullName: string;
    parentEmail: string | null;
    subject: string;
    year: string;
    tutor: {
      email: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get session with student and tutor info
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        student: {
          include: {
            tutor: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if session is in the next 24 hours
    if (!isInNext24Hours(session.startTime)) {
      return NextResponse.json(
        { error: 'Session is not in the next 24 hours' },
        { status: 400 }
      );
    }

    // Send email to parent if email exists
    if (session.student.parentEmail) {
      await sendParentReminder(session as SessionWithStudentAndTutor);
    }

    // Send email to tutor
    await sendTutorReminder(session as SessionWithStudentAndTutor);

    return NextResponse.json({ message: 'Reminders sent successfully' });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

async function sendParentReminder(session: SessionWithStudentAndTutor) {
  if (!resend) {
    console.warn('Resend not initialized, skipping parent reminder.');
    return;
  }
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: session.student.parentEmail!,
    subject: `Reminder: ${session.student.fullName}'s tutoring session tomorrow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Session Reminder</h2>
        <p>Hello,</p>
        <p>This is a reminder that <strong>${session.student.fullName}</strong> has a tutoring session scheduled for tomorrow.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Session Details</h3>
          <p><strong>Date:</strong> ${formatDate(session.startTime)}</p>
          <p><strong>Time:</strong> ${formatTime(session.startTime)}</p>
          <p><strong>Duration:</strong> ${Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))} minutes</p>
          <p><strong>Subject:</strong> ${session.student.subject}</p>
        </div>
        
        <p>Please ensure ${session.student.fullName} is prepared and ready for the session.</p>
        
        <p>If you have any questions, please contact the tutor directly.</p>
        
        <p>Best regards,<br>The Nova Team</p>
      </div>
    `,
  });

  if (error) {
    console.error('Error sending parent reminder:', error);
  }
}

async function sendTutorReminder(session: SessionWithStudentAndTutor) {
  if (!resend) {
    console.warn('Resend not initialized, skipping tutor reminder.');
    return;
  }
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to: session.student.tutor.email,
    subject: `Reminder: ${session.student.fullName}'s session tomorrow`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Session Reminder</h2>
        <p>Hello,</p>
        <p>This is a reminder that you have a tutoring session scheduled for tomorrow.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Session Details</h3>
          <p><strong>Student:</strong> ${session.student.fullName}</p>
          <p><strong>Date:</strong> ${formatDate(session.startTime)}</p>
          <p><strong>Time:</strong> ${formatTime(session.startTime)}</p>
          <p><strong>Duration:</strong> ${Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))} minutes</p>
          <p><strong>Subject:</strong> ${session.student.subject}</p>
          <p><strong>Year/Level:</strong> ${session.student.year}</p>
        </div>
        
        <p>Please review any previous session notes and prepare for the upcoming session.</p>
        
        <p>Best regards,<br>The Nova Team</p>
      </div>
    `,
  });

  if (error) {
    console.error('Error sending tutor reminder:', error);
  }
}
