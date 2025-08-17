import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Create a new student-tutor connection request
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { tutorId, subject, requestMessage } = await request.json();

    if (!tutorId || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: tutorId and subject are required' },
        { status: 400 }
      );
    }

    // Find the student account
    const student = await prisma.student.findUnique({
      where: { userId: user.id }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student account not found. Please create a student account first.' },
        { status: 404 }
      );
    }

    // Check if connection already exists
    const existingConnection = await prisma.studentTutorConnection.findUnique({
      where: {
        studentId_tutorId_subject: {
          studentId: student.id,
          tutorId,
          subject
        }
      }
    });

    if (existingConnection) {
      return NextResponse.json(
        { error: 'Connection request already exists for this tutor and subject' },
        { status: 409 }
      );
    }

    // Verify tutor exists
    const tutor = await prisma.tutor.findUnique({
      where: { id: tutorId },
      include: { profile: true }
    });

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Create the connection request
    const connection = await prisma.studentTutorConnection.create({
      data: {
        studentId: student.id,
        tutorId,
        subject,
        requestMessage: requestMessage || null,
        status: 'pending'
      },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            preferredSubjects: true,
            gradeLevel: true
          }
        },
        tutor: {
          include: {
            profile: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Connection request sent successfully',
      connection
    });
  } catch (error) {
    console.error('Error creating student-tutor connection:', error);
    return NextResponse.json(
      { error: 'Failed to create connection request' },
      { status: 500 }
    );
  } finally {
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}

// Get student's connections
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Find the student account
    const student = await prisma.student.findUnique({
      where: { userId: user.id }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student account not found' },
        { status: 404 }
      );
    }

    // Build where clause
    const where: { studentId: string; status?: string } = {
      studentId: student.id
    };

    if (status) {
      where.status = status;
    }

    const connections = await prisma.studentTutorConnection.findMany({
      where,
      include: {
        tutor: {
          include: {
            profile: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ connections });
  } catch (error) {
    console.error('Error fetching student connections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connections' },
      { status: 500 }
    );
  } finally {
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}
