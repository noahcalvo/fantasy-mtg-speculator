'use client';
import { useDraftRealtime } from '@/app/lib/useDraftRealtime';
import { useEffect, useMemo, useState } from 'react';

export default function PauseResumeDraft({
  draftId,
  leagueId,
  commissioner,
}: {
  draftId: number;
  leagueId: number;
  commissioner: boolean;
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  // initial load
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/draft/${draftId}/status`);
        if (!res.ok) throw new Error('Failed to fetch draft status');
        const data = await res.json();
        setIsPaused(data.isPaused);
        setConnectionError(false);
      } catch (e) {
        console.error('Failed to fetch draft status:', e);
        setError('Failed to fetch draft status');
        setConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [draftId]);

  // 👇 memoize handlers so their identity doesn't change every render
  const handlers = useMemo(
    () => ({
      paused: () => {
        setIsPaused(true);
      },
      resumed: () => {
        setIsPaused(false);
      },
      onConnectionIssue: setConnectionError,
    }),
    [setConnectionError],
  );

  // 👇 single hook call
  useDraftRealtime(draftId, handlers, 'pause');

  const handlePauseResume = async () => {
    try {
      setError(null);
      const action = isPaused ? 'resume' : 'pause';
      const response = await fetch(`/api/draft/${draftId}/pause`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          leagueId: action === 'pause' ? leagueId : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update draft status');
      }

      setIsPaused(!isPaused);
    } catch (err) {
      console.error('Failed to toggle draft status:', err);
      setError('Failed to update draft status');
    }
  };

  if (isLoading) {
    return (
      <div className="my-2 flex items-center justify-center gap-2">
        <button disabled className="cursor-not-allowed opacity-50">
          Loading...
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-2 flex items-center justify-center gap-2">
        <div className="text-sm text-red-500">
          {error}
          {connectionError && (
            <div className="mt-1 text-xs text-yellow-600">
              ⚠️ Real-time updates may be delayed
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="ml-2 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  if (!commissioner) {
    return (
      <div className="my-2 flex items-center justify-center gap-2">
        {isPaused ? 'Paused' : ''}
        {connectionError && (
          <span
            className="ml-2 text-xs text-yellow-600"
            title="Connection issues detected"
          >
            ⚠️
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="my-2 flex items-center justify-center gap-2">
      <button
        onClick={handlePauseResume}
        className="rounded border border-gray-950 bg-red-800 px-4 py-2 text-white transition-colors hover:bg-red-900"
      >
        {isPaused ? 'Resume Draft' : 'Pause Draft'}
      </button>
      {connectionError && (
        <span
          className="text-xs text-yellow-600"
          title="Real-time updates may be delayed"
        >
          ⚠️
        </span>
      )}
    </div>
  );
}
