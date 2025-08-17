import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Get student account by authenticated user
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

    // Find the student account
    const student = await prisma.student.findUnique({
      where: { userId: user.id },
      include: {
        tutorConnections: {
          include: {
            tutor: {
              include: {
                profile: true
              }
            }
          }
        },
        tutor: true, // Include legacy tutor relationship
        parents: true // Include parent relationships
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Error fetching student account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student account' },
      { status: 500 }
    );
  } finally {
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}

// Update student account
export async function PATCH(request: NextRequest) {
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

    const updateData = await request.json();
    
    // Remove fields that shouldn't be updated
    const { userId, email, createdAt, ...allowedUpdates } = updateData;

    // Update the student account
    const updatedStudent = await prisma.student.update({
      where: { userId: user.id },
      data: allowedUpdates,
      include: {
        tutorConnections: {
          include: {
            tutor: {
              include: {
                profile: true
              }
            }
          }
        },
        tutor: true,
        parents: true
      }
    });

    return NextResponse.json({ 
      message: 'Student account updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student account:', error);
    return NextResponse.json(
      { error: 'Failed to update student account' },
      { status: 500 }
    );
  } finally {
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}
