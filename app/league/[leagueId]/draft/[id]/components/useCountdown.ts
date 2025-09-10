// app/.../useCountdown.ts
'use client';
import { useEffect, useMemo, useState } from 'react';

export function useCountdown(deadlineAt?: string | Date | null, paused?: boolean) {
  const deadlineMs = useMemo(
    () => (deadlineAt ? new Date(deadlineAt).getTime() : NaN),
    [deadlineAt]
  );
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (!deadlineAt || paused) return;
    // tick ~5x/sec for a smooth countdown without burning CPU
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [deadlineAt, paused]);

  const remainingMs = useMemo(() => {
    if (!deadlineAt) return 0;
    const ms = deadlineMs - now;
    return ms > 0 ? ms : 0;
  }, [deadlineMs, now, deadlineAt]);

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;
  const mmss = `${mm}:${ss.toString().padStart(2, '0')}`;

  return { remainingMs, totalSeconds, mmss };
}
