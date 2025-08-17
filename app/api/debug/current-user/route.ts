import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: authError?.message 
      }, { status: 401 });
    }

    // Check if tutor record exists
    const tutor = await prisma.tutor.findUnique({
      where: { id: user.id },
      include: { profile: true }
    });

    // Check if profile exists
    const profile = await prisma.tutorProfile.findUnique({
      where: { tutorId: user.id }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata,
        createdAt: user.created_at
      },
      tutor: tutor ? {
        id: tutor.id,
        email: tutor.email,
        createdAt: tutor.createdAt,
        hasProfile: !!tutor.profile
      } : null,
      profile: profile ? {
        id: profile.id,
        displayName: profile.displayName,
        subjects: profile.subjects,
        country: profile.country,
        city: profile.city,
        createdAt: profile.createdAt
      } : null,
      debug: {
        userId: user.id,
        hasTutorRecord: !!tutor,
        hasProfile: !!profile,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
