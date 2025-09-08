'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPusher } from '@/app/lib/realtimeClient';

type DraftEvent =
  | 'paused'
  | 'resumed'
  | 'pick_made'
  | 'clock_started'
  | 'draft_complete';

type Handlers = Partial<Record<DraftEvent, (payload: any) => void>> & {
  onConnectionIssue?: (bad: boolean) => void;
};

export function useDraftRealtime(draftId: number, handlers?: Handlers) {
  const router = useRouter();

  useEffect(() => {
    const p = getPusher();
    const ch = p.subscribe(`draft-${draftId}`);

    // default: refresh server components on impactful events
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => router.refresh(), 120);
    };

    const bind = <T,>(ev: DraftEvent, fn?: (payload: T) => void) => {
      ch.bind(ev, (data: T) => {
        // always call specific handler if provided
        fn?.(data);
        // also refresh on these so server-rendered bits (e.g. timers) update
        if (
          ev === 'pick_made' ||
          ev === 'clock_started' ||
          ev === 'draft_complete'
        ) {
          refresh();
        }
      });
    };

    bind('paused', handlers?.paused);
    bind('resumed', handlers?.resumed);
    bind('pick_made', handlers?.pick_made);
    bind('clock_started', handlers?.clock_started);
    bind('draft_complete', handlers?.draft_complete);

    const setConn = handlers?.onConnectionIssue;
    const bad = () => setConn?.(true);
    const good = () => setConn?.(false);
    p.connection.bind('error', bad);
    p.connection.bind('failed', bad);
    p.connection.bind('unavailable', bad);
    p.connection.bind('connected', good);

    return () => {
      ch.unbind_all();
      p.connection.unbind('error', bad);
      p.connection.unbind('failed', bad);
      p.connection.unbind('unavailable', bad);
      p.connection.unbind('connected', good);
      p.unsubscribe(`draft-${draftId}`);
    };
  }, [draftId, router, handlers]);
}
