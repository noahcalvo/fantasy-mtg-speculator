'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DraftPick, Player } from '@/app/lib/definitions';
import DraftPickCell from './draftPickCell';
import { getActivePick } from '@/app/lib/clientActions';
import { fetchDraft, fetchPicks, fetchPicksUncached } from '@/app/lib/draft';
import { notFound } from 'next/navigation';
import { fetchMultipleParticipantData } from '@/app/lib/player';
import ActivePickCell from './activePickCell';
import { useDraftRealtime } from '@/app/lib/useDraftRealtime';
import { createPickDeadline } from '@/app/lib/utils';

function equalPicks(a: DraftPick[], b: DraftPick[]) {
  console.log('equalPicks', a, b);
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    // compare stable fields that matter for rendering
    if (
      a[i].pick_id !== b[i].pick_id ||
      a[i].card_id !== b[i].card_id ||
      a[i].round !== b[i].round ||
      a[i].pick_number !== b[i].pick_number ||
      a[i].player_id !== b[i].player_id
    )
      return false;
  }
  return true;
}

const DraftGrid = ({ draftId }: { draftId: number }) => {
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [participants, setParticipants] = useState<Player[]>([]);
  const [connectionIssue, setConnectionIssue] = useState(false);
  const [deadlineAt, setDeadlineAt] = useState('0');
  const [pausedAt, setPausedAt] = useState<string | null>(null);
  const [pickTime, setPickTime] = useState(0);

  const rounds = useMemo(
    () => (picks.length ? Math.max(...picks.map((p) => p.round)) + 1 : 0),
    [picks],
  );
  const activePick = useMemo(() => getActivePick(picks), [picks]);

  // Stable fetcher so our WS handlers don't capture stale closures
  const fetchData = useCallback(async () => {
    try {
      const newPicks = await fetchPicksUncached(draftId);
      const draft = await fetchDraft(draftId);
      if (!draft) notFound();
      setDeadlineAt(draft.current_pick_deadline_at);
      setPausedAt(draft.paused_at);
      setPickTime(draft.pick_time_seconds || 0);
      const participantsData = await fetchMultipleParticipantData(
        draft.participants,
      );

      setPicks((prev) => (equalPicks(prev, newPicks) ? prev : newPicks));

      // Update participants if changed
      setParticipants((prev) => {
        if (JSON.stringify(participantsData) !== JSON.stringify(prev)) {
          return participantsData;
        }
        return prev;
      });
    } catch (err) {
      console.error('[DraftGrid] fetchData error:', err);
    }
  }, [draftId]);

  // Optional: keep a very gentle poll only when connection is bad
  useEffect(() => {
    if (!connectionIssue) return;
    const id = setInterval(fetchData, 10000);
    return () => clearInterval(id);
  }, [connectionIssue, fetchData]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useDraftRealtime(
    draftId,
    {
      paused: () => fetchData(),
      resumed: () => {
        fetchData();
      },
      pick_made: (msg?: any) => {
        const { pickId, cardId } = msg || {};
        if (!pickId) return fetchData();

        setPicks((prev) => {
          const next = prev.map((p) =>
            p.pick_id === pickId ? { ...p, card_id: cardId } : p,
          );
          return next;
        });

        console.log('pick time seconds', pickTime);
        console.log('createPickDeadline', createPickDeadline(pickTime));
        console.log('current_pick_deadline_at', deadlineAt);

        setDeadlineAt(createPickDeadline(pickTime));
        // fire-and-forget reconcile
        fetchData();
      },
      draft_complete: () => fetchData(),
      onConnectionIssue: setConnectionIssue,
    },
    'grid',
  );

  return (
    <div className="h-fit max-h-[40vh] overflow-auto border-2 border-gray-950 xl:max-h-[80vh]">
      <table className="table-fixed divide-y divide-gray-950 border-gray-950 bg-gray-950">
        <thead className="sticky top-0 z-30">
          <tr>
            {participants.map((participant, index) => (
              <th
                key={index}
                className="no-scrollbar text-responsive overflow-auto border-gray-950 bg-gray-950 px-1 py-2 text-center text-xs capitalize text-gray-50"
              >
                <div className="w-24">{participant.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rounds }, (_, roundIndex) => (
            <tr key={roundIndex} className="space-y-2">
              {participants.map((participant, participantIndex) => {
                const pick = picks.find(
                  (p) =>
                    p.round === roundIndex &&
                    p.player_id === participant.player_id,
                );
                const activePickNumber = activePick?.pick_number ?? 0;
                const activePickRound = activePick?.round ?? 0;
                const pickNumber = pick?.pick_number ?? 0;
                const pickRound = pick?.round ?? 0;
                const picksTilActive =
                  (pickRound - activePickRound) * participants.length -
                  activePickNumber +
                  pickNumber;

                const isActive = picksTilActive === 0;

                return isActive ? (
                  <ActivePickCell
                    key={participantIndex}
                    pick={pick as DraftPick}
                    picksTilActive={picksTilActive}
                    pausedAt={pausedAt}
                    deadlineAt={deadlineAt}
                  />
                ) : (
                  <DraftPickCell
                    key={participantIndex}
                    pick={pick as DraftPick}
                    picksTilActive={picksTilActive}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DraftGrid;
