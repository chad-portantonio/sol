import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('Auth callback called with:', {
    code: code ? 'present' : 'missing',
    token: token ? 'present' : 'missing',
    type,
    origin,
    url: request.url,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  // Handle case where user might be accessing this directly from a Supabase verification URL
  // If we have no code or token, check if we need to redirect them to the sign-in page
  if (!code && !token) {
    console.log('No auth parameters found - redirecting to sign-in');
    return NextResponse.redirect(`${origin}/sign-in?message=Please request a new magic link to sign in.`);
  }

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

  // Handle OAuth/PKCE flow (with code parameter) - this includes magic links using PKCE
  if (code) {
    console.log('Processing PKCE code exchange for authentication');
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth code exchange failed:', error);
      return NextResponse.redirect(`${origin}/sign-in?error=Authentication failed: ${encodeURIComponent(error.message)}`);
    }
    
    // Successfully confirmed email and signed in
    console.log('PKCE authentication successful (including magic links)');
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Determine if this is a tutor or student based on redirect path or user metadata
      const isStudentFlow = next.includes('/student') || user.user_metadata?.role === 'student' || user.user_metadata?.role === 'parent';
      
      if (isStudentFlow) {
        // Try to create student/parent record if it doesn't exist
        try {
          const response = await fetch(`${origin}/api/students/create-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
              role: user.user_metadata?.role || 'student',
              studentId: user.user_metadata?.student_id || null,
            }),
          });
          
          if (response.ok) {
            console.log('Student/parent profile created successfully');
          } else if (response.status === 409) {
            console.log('Student/parent profile already exists');
          } else {
            console.warn('Failed to create student/parent profile, but proceeding with login');
          }
        } catch (error) {
          console.warn('Error creating student/parent profile:', error);
          // Don't fail the authentication if creation fails
        }
      } else {
        // Try to create tutor record if it doesn't exist
        try {
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
        } catch (error) {
          console.warn('Error creating tutor profile:', error);
          // Don't fail the authentication if tutor creation fails
        }
      }
    }
    
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Handle email confirmation flow (with token and type parameters)
  if (token && type) {
    console.log(`Processing token verification for type: ${type}`);
    let authResult;
    
    if (type === 'magiclink') {
      // Handle traditional magic link verification
      console.log('Traditional magic link authentication detected');
      authResult = { error: null };
    } else if (type === 'signup' || type === 'recovery' || type === 'email_change') {
      // Handle OTP verification for signup confirmations, recovery, etc.
      console.log(`Processing OTP verification for type: ${type}`);
      authResult = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as 'signup' | 'recovery' | 'email_change',
      });
    } else {
      console.warn(`Unknown verification type: ${type}`);
      authResult = { error: new Error(`Unsupported verification type: ${type}`) };
    }
    
    if (authResult.error) {
      console.error('Email verification failed:', authResult.error);
      return NextResponse.redirect(`${origin}/sign-in?error=Email verification failed: ${encodeURIComponent(authResult.error.message)}`);
    }
    
    // Successfully confirmed email and signed in
    console.log('Email verification successful');
    
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Determine if this is a tutor or student based on redirect path or user metadata
      const isStudentFlow = next.includes('/student') || user.user_metadata?.role === 'student' || user.user_metadata?.role === 'parent';
      
      if (isStudentFlow) {
        // Try to create student/parent record if it doesn't exist
        try {
          const response = await fetch(`${origin}/api/students/create-account`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Student',
              role: user.user_metadata?.role || 'student',
              studentId: user.user_metadata?.student_id || null,
            }),
          });
          
          if (response.ok) {
            console.log('Student/parent profile created successfully');
          } else if (response.status === 409) {
            console.log('Student/parent profile already exists');
          } else {
            console.warn('Failed to create student/parent profile, but proceeding with login');
          }
        } catch (error) {
          console.warn('Error creating student/parent profile:', error);
          // Don't fail the authentication if creation fails
        }
      } else {
        // Try to create tutor record if it doesn't exist
        try {
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
        } catch (error) {
          console.warn('Error creating tutor profile:', error);
          // Don't fail the authentication if tutor creation fails
        }
      }
    }
    
    return NextResponse.redirect(`${origin}${next}`);
  }

  // If there's no code or token, redirect to sign-in with error message
  console.log('No auth code or verification token found in callback URL');
  return NextResponse.redirect(`${origin}/sign-in?error=No verification code or token found. Please check your email link.`);
}
