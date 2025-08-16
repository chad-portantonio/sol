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
    searchParams: Object.fromEntries(searchParams.entries())
  });

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

  // Handle OAuth/PKCE flow (with code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth code exchange failed:', error);
      return NextResponse.redirect(`${origin}/sign-in?error=Email verification failed: ${encodeURIComponent(error.message)}`);
    }
    
    // Successfully confirmed email and signed in
    console.log('OAuth/PKCE authentication successful');
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Handle email confirmation flow (with token and type parameters)
  if (token && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });
    
    if (error) {
      console.error('Email verification failed:', error);
      return NextResponse.redirect(`${origin}/sign-in?error=Email verification failed: ${encodeURIComponent(error.message)}`);
    }
    
    // Successfully confirmed email and signed in
    console.log('Email verification successful');
    return NextResponse.redirect(`${origin}${next}`);
  }

  // If there's no code or token, redirect to sign-in with error message
  console.log('No auth code or verification token found in callback URL');
  return NextResponse.redirect(`${origin}/sign-in?error=No verification code or token found. Please check your email link.`);
}
