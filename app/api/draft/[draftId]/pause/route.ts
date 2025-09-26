import { NextRequest, NextResponse } from 'next/server';
import { pauseDraft, resumeDraft } from '@/app/lib/draft';

export async function POST(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const draftId = parseInt(params.draftId);
    const body = await request.json();
    const { action, leagueId } = body;

    if (isNaN(draftId)) {
      return NextResponse.json(
        { error: 'Invalid draft ID' },
        { status: 400 }
      );
    }

    if (action === 'pause') {
      if (!leagueId) {
        return NextResponse.json(
          { error: 'League ID is required for pausing' },
          { status: 400 }
        );
      }
      await pauseDraft(draftId, leagueId);
      return NextResponse.json({ success: true, action: 'paused' });
    } else if (action === 'resume') {
      await resumeDraft(draftId);
      return NextResponse.json({ success: true, action: 'resumed' });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "pause" or "resume"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Failed to toggle draft status:', error);
    return NextResponse.json(
      { error: 'Failed to update draft status' },
      { status: 500 }
    );
  }
}
