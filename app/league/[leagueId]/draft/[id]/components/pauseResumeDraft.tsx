'use client';
import { useEffect, useState } from 'react';
import { useDraftRealtime } from './useDraftRealtime';

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

  function setPaused(paused: boolean) {
    setIsPaused(paused);
    console.log('Draft is now', paused ? 'paused' : 'resumed');
  }

  // fetch the draft status from server if needed
  useEffect(() => {
    const fetchDraftStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/draft/${draftId}/status`);
        if (!response.ok) {
          throw new Error('Failed to fetch draft status');
        }
        const data = await response.json();
        setIsPaused(data.isPaused);
        setConnectionError(false);
      } catch (err) {
        console.error('Failed to fetch draft status:', err);
        setError('Failed to fetch draft status');
        setConnectionError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDraftStatus();
  }, [draftId]);

  useDraftRealtime(draftId, {
    paused: () => setPaused(true),
    resumed: () => setIsPaused(false),
    onConnectionIssue: setConnectionError,
  });

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
      <button disabled className="cursor-not-allowed opacity-50">
        Loading...
      </button>
    );
  }

  if (error) {
    return (
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
    );
  }
  if (!commissioner) {
    return (
      <span>
        {isPaused ? 'Paused' : ''}
        {connectionError && (
          <span
            className="ml-2 text-xs text-yellow-600"
            title="Connection issues detected"
          >
            ⚠️
          </span>
        )}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePauseResume}
        className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
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
