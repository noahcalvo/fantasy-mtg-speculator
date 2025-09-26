'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { acquireChannel, getPusher } from '@/app/lib/realtimeClient';

type DraftEvent =
  | 'paused'
  | 'resumed'
  | 'pick_made'
  | 'clock_started'
  | 'draft_complete'
  | 'player_joined';

type Handlers = Partial<Record<DraftEvent, (payload: any) => void>> & {
  onConnectionIssue?: (bad: boolean) => void;
};

export function useDraftRealtime(
  draftId: number,
  handlers?: Handlers,
  debugLabel?: string,
) {
  const router = useRouter();
  const handlersRef = useRef<Handlers>({});
  // keep the latest handlers without retriggering the subscription
  useEffect(() => {
    handlersRef.current = handlers ?? {};
  }, [handlers]);

  useEffect(() => {
    const channelName = `draft-${draftId}`;
    const p = getPusher();
    const ch = acquireChannel(channelName);

    // default: refresh server components on impactful events
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => router.refresh(), 120);
    };

    // stable callbacks (so we can unbind them)
    const on = (ev: DraftEvent) => (data: any) => {
      handlersRef.current?.[ev]?.(data);
      if (
        ev === 'pick_made' ||
        ev === 'clock_started' ||
        ev === 'draft_complete'
      ) {
        refresh();
      }
    };

    const onPaused = on('paused');
    const onResumed = on('resumed');
    const onPick = on('pick_made');
    const onClock = on('clock_started');
    const onDone = on('draft_complete');

    ch.bind('paused', onPaused);
    ch.bind('resumed', onResumed);
    ch.bind('pick_made', onPick);
    ch.bind('clock_started', onClock);
    ch.bind('draft_complete', onDone);

    const connBad = () => handlersRef.current?.onConnectionIssue?.(true);
    const connGood = () => handlersRef.current?.onConnectionIssue?.(false);
    p.connection.bind('error', connBad);
    p.connection.bind('failed', connBad);
    p.connection.bind('unavailable', connBad);
    p.connection.bind('connected', connGood);

    return () => {
      ch.unbind('paused', onPaused);
      ch.unbind('resumed', onResumed);
      ch.unbind('pick_made', onPick);
      ch.unbind('clock_started', onClock);
      ch.unbind('draft_complete', onDone);
      p.connection.unbind('error', connBad);
      p.connection.unbind('failed', connBad);
      p.connection.unbind('unavailable', connBad);
      p.connection.unbind('connected', connGood);
      p.unsubscribe(`draft-${draftId}`);
    };
  }, [draftId, router]); // ← NOTE: no 'handlers' here
}
