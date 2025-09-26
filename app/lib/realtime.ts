// lib/realtime.ts  (SERVER ONLY)
import 'server-only';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

type DraftEvent =
  | 'paused'
  | 'resumed'
  | 'pick_made'
  | 'clock_started'
  | 'draft_complete';

export async function broadcastDraft(
  draftId: number,
  type: DraftEvent,
  payload: Record<string, unknown> = {}
) {
  await pusher.trigger(`draft-${draftId}`, type, { type, ...payload });
}
