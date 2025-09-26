// /app/lib/useDraftRealtime.ts
'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  acquireChannel,
  releaseChannel,
  getPusher,
} from '@/app/lib/realtimeClient';

type DraftEvent =
  | 'paused'
  | 'resumed'
  | 'pick_made'
  | 'clock_started'
  | 'draft_complete';
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
  useEffect(() => {
    handlersRef.current = handlers ?? {};
  }, [handlers]);

  useEffect(() => {
    const name = `draft-${draftId}`;
    const ch = acquireChannel(name);
    const p = getPusher();

    // — optional global debug to prove binding per component —
    const global = (event: string, data: any) => {
      if (event.startsWith('pusher')) return;
      console.log(`[rt:${debugLabel ?? 'sub'}] global "${event}"`, data);
    };
    ch.bind_global(global);

    let t: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (t) clearTimeout(t);
      t = setTimeout(() => router.refresh(), 120);
    };

    const mk = (ev: DraftEvent) => (data: any) => {
      console.log(`[rt:${debugLabel ?? 'sub'}] "${ev}"`);
      handlersRef.current?.[ev]?.(data);
      if (
        ev === 'pick_made' ||
        ev === 'clock_started' ||
        ev === 'draft_complete'
      )
        refresh();
    };

    const onPaused = mk('paused');
    const onResumed = mk('resumed');
    const onPick = mk('pick_made');
    const onClock = mk('clock_started');
    const onDone = mk('draft_complete');

    ch.bind('paused', onPaused);
    ch.bind('resumed', onResumed);
    ch.bind('pick_made', onPick);
    ch.bind('clock_started', onClock);
    ch.bind('draft_complete', onDone);

    const bad = () => handlersRef.current?.onConnectionIssue?.(true);
    const good = () => handlersRef.current?.onConnectionIssue?.(false);
    p.connection.bind('error', bad);
    p.connection.bind('failed', bad);
    p.connection.bind('unavailable', bad);
    p.connection.bind('connected', good);

    return () => {
      ch.unbind('paused', onPaused);
      ch.unbind('resumed', onResumed);
      ch.unbind('pick_made', onPick);
      ch.unbind('clock_started', onClock);
      ch.unbind('draft_complete', onDone);
      ch.unbind_global(global);
      p.connection.unbind('error', bad);
      p.connection.unbind('failed', bad);
      p.connection.unbind('unavailable', bad);
      p.connection.unbind('connected', good);
      releaseChannel(name);
    };
  }, [draftId, router, debugLabel]);
}
