import { NextRequest, NextResponse } from 'next/server';
import { getPausedStatus } from '@/app/lib/draft';

export async function GET(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const draftId = parseInt(params.draftId);

    if (isNaN(draftId)) {
      return NextResponse.json(
        { error: 'Invalid draft ID' },
        { status: 400 }
      );
    }

    const pausedAt = await getPausedStatus(draftId);

    return NextResponse.json({
      isPaused: !!pausedAt,
      pausedAt: pausedAt || null
    });
  } catch (error) {
    console.error('Failed to fetch draft status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft status' },
      { status: 500 }
    );
  }
}
