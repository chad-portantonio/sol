import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    url: request.url,
    searchParams: Object.fromEntries(searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
  };

  console.log('🔧 DEBUG AUTH ENDPOINT:', debugInfo);

  // Test Supabase connection
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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    debugInfo.supabase = {
      hasSession: !!session,
      sessionError: sessionError?.message,
      hasUser: !!user,
      userError: userError?.message,
      userId: user?.id,
      userEmail: user?.email,
    };

  } catch (error) {
    debugInfo.supabaseError = error instanceof Error ? error.message : 'Unknown error';
  }

  return NextResponse.json(debugInfo, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Handle any POST debugging if needed
  const body = await request.text();
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    method: 'POST',
    url: request.url,
    body,
    headers: Object.fromEntries(request.headers.entries()),
  };

  console.log('🔧 DEBUG AUTH POST:', debugInfo);
  
  return NextResponse.json(debugInfo, { status: 200 });
}
