import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In the current schema, we don't have a Parent model
    // Parents access student information through the parentLinkToken system
    // This endpoint should not be used with the current schema
    
    return NextResponse.json(
      { error: 'Parent access not implemented with current schema. Use parentLinkToken instead.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching parent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parent' },
      { status: 500 }
    );
  }
}
