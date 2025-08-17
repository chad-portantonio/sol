import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const type = searchParams.get('type');
  
  console.log('🔍 DEBUG AUTH ENDPOINT:', {
    timestamp: new Date().toISOString(),
    token: token ? `present (${token.substring(0, 15)}...)` : 'missing',
    type,
    allParams: Object.fromEntries(searchParams.entries()),
    headers: {
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      host: request.headers.get('host'),
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Debug endpoint working',
    timestamp: new Date().toISOString(),
    token: token ? `present (${token.substring(0, 15)}...)` : 'missing',
    type,
    allParams: Object.fromEntries(searchParams.entries()),
  });
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
