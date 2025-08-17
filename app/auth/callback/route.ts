import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('🔍 AUTH CALLBACK DEBUGGING:', {
    timestamp: new Date().toISOString(),
    fullUrl: request.url,
    origin,
    code: code ? `present (${code.substring(0, 10)}...)` : 'missing',
    next,
    allParams: Object.fromEntries(searchParams.entries()),
  });

  // Handle PKCE flow (magic links and OAuth)
  if (code) {
    console.log('Processing PKCE code exchange for authentication');
    
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
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Handle cookie setting error silently
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth code exchange failed:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        hint: 'Ensure the site URL and redirect URLs are correctly configured in Supabase Auth settings.'
      });
      return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent('Authentication failed. Please request a new magic link or ensure you used the most recent email.')}`);
    }
    
    // Successfully authenticated
    console.log('PKCE authentication successful');
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Try to create user profile if it doesn't exist
      try {
        // Determine if this is a tutor or student based on user metadata
        const isStudentFlow = user.user_metadata?.role === 'student' || user.user_metadata?.role === 'parent';
        
        if (isStudentFlow) {
          const role = user.user_metadata?.role || 'student';
          
          // Use unified student account creation API
          const response = await fetch(`${origin}/api/student-accounts/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || (role === 'parent' ? 'Parent' : 'Student'),
              preferredSubjects: user.user_metadata?.preferred_subjects || [],
              gradeLevel: user.user_metadata?.grade_level || null,
              bio: user.user_metadata?.bio || null,
              role: role,
              studentId: user.user_metadata?.student_id || null,
            }),
          });
          
          if (response.ok) {
            console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`);
          } else if (response.status === 409) {
            console.log(`${role.charAt(0).toUpperCase() + role.slice(1)} account already exists`);
          } else {
            console.warn(`Failed to create ${role} account, but proceeding with login`);
          }
        } else {
          // Try to create tutor record
          const response = await fetch(`${origin}/api/tutors/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
            }),
          });
          
          if (response.ok) {
            console.log('Tutor profile created successfully');
          } else if (response.status === 409) {
            console.log('Tutor profile already exists');
          } else {
            console.warn('Failed to create tutor profile, but proceeding with login');
          }
        }
      } catch (error) {
        console.warn('Error creating user profile:', error);
        // Don't fail the authentication if profile creation fails
      }
    }
    
    return NextResponse.redirect(`${origin}${next}`);
  }

  // If there's no code, redirect to sign-in with error message
  console.log('No auth code found in callback URL', { url: request.url });
  return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent('No verification code found. Please open the most recent magic link email and try again.')}`);
}
