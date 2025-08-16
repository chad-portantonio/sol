import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/dashboard';

  console.log('🔍 AUTH CALLBACK DEBUGGING:', {
    timestamp: new Date().toISOString(),
    fullUrl: request.url,
    origin,
    domain: new URL(request.url).hostname,
    code: code ? `present (${code.substring(0, 10)}...)` : 'missing',
    token: token ? `present (type: ${token.startsWith('pkce_') ? 'PKCE' : 'OTP'}, ${token.substring(0, 15)}...)` : 'missing',
    type,
    next,
    allParams: Object.fromEntries(searchParams.entries()),
    headers: {
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      host: request.headers.get('host'),
    }
  });

  // Handle direct Supabase verification URLs that might be accessed directly
  // If we have no code or token, but this might be a direct verification URL, handle it differently
  if (!code && !token) {
    console.log('⚠️ No auth parameters found in callback');
    
    // Check if this might be a user accessing a Supabase verification URL directly
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    
    console.log('🔍 Checking for direct Supabase access:', { userAgent, referer });
    
    // If this looks like a direct browser access, provide helpful guidance
    if (userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari')) {
      return NextResponse.redirect(`${origin}/sign-in?error=Magic link expired or invalid. Please request a new magic link to sign in.`);
    }
    
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
    console.log(`🔐 Processing token verification for type: ${type}`);
    let authResult;
    
    if (type === 'magiclink') {
      // Handle traditional magic link verification
      console.log('✅ Traditional magic link authentication detected');
      authResult = { error: null };
    } else if (type === 'signup' || type === 'recovery' || type === 'email_change') {
      // Handle OTP verification for signup confirmations, recovery, etc.
      console.log(`🔐 Processing OTP verification for type: ${type}`);
      
      try {
        // Handle both PKCE and traditional tokens - try multiple approaches
        console.log('🔄 Attempting token verification...');
        
        if (token.startsWith('pkce_')) {
          console.log('🔑 PKCE token detected - trying different verification methods');
          
          // First, try treating PKCE token as authorization code (some Supabase versions)
          try {
            console.log('Attempt 1: PKCE token as authorization code');
            const codeResult = await supabase.auth.exchangeCodeForSession(token);
            if (!codeResult.error) {
              console.log('✅ PKCE token authorization code exchange successful');
              authResult = codeResult;
            } else {
              throw codeResult.error;
            }
          } catch (codeError) {
            console.log('Attempt 1 failed, trying OTP verification');
            // If that fails, try OTP verification
            try {
              authResult = await supabase.auth.verifyOtp({
                token_hash: token,
                type: type as 'signup' | 'recovery' | 'email_change',
              });
              console.log('✅ PKCE token OTP verification successful');
            } catch (otpError) {
              console.error('🚨 Both PKCE verification methods failed');
              authResult = { error: otpError instanceof Error ? otpError : new Error('PKCE token verification failed') };
            }
          }
        } else {
          // Traditional OTP verification for non-PKCE tokens
          console.log('🔐 Traditional OTP verification');
          authResult = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type as 'signup' | 'recovery' | 'email_change',
          });
        }
      } catch (error) {
        console.error('🚨 Token verification failed:', error);
        authResult = { error: error instanceof Error ? error : new Error('Token verification failed') };
      }
    } else {
      console.warn(`❌ Unknown verification type: ${type}`);
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
