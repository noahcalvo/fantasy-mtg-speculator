'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DraftPick, Player } from '@/app/lib/definitions';
import DraftPickCell from './draftPickCell';
import { getActivePick } from '@/app/lib/clientActions';
import { fetchDraft, fetchPicks } from '@/app/lib/draft';
import { notFound } from 'next/navigation';
import { fetchMultipleParticipantData } from '@/app/lib/player';
import ActivePickCell from './activePickCell';
import { useDraftRealtime } from '@/app/lib/useDraftRealtime';
import { set } from 'date-fns';
import { createPickDeadline } from '@/app/lib/utils';

const DraftGrid = ({ draftId }: { draftId: number }) => {
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [participants, setParticipants] = useState<Player[]>([]);
  const [rounds, setRounds] = useState(0);
  const [activePick, setActivePick] = useState<DraftPick | undefined>();
  const [connectionIssue, setConnectionIssue] = useState(false);
  const [deadlineAt, setDeadlineAt] = useState('0');
  const [pausedAt, setPausedAt] = useState<string | null>(null);
  const [pickTime, setPickTime] = useState(0);

  // Stable fetcher so our WS handlers don't capture stale closures
  const fetchData = useCallback(async () => {
    try {
      const newPicks = await fetchPicks(draftId);
      const draft = await fetchDraft(draftId);
      if (!draft) notFound();
      setDeadlineAt(draft.current_pick_deadline_at);
      setPausedAt(draft.paused_at);
      setPickTime(draft.pick_time_seconds || 0);
      const participantsData = await fetchMultipleParticipantData(
        draft.participants,
      );

      // Update picks + derived state if changed
      setPicks((prev) => {
        if (JSON.stringify(newPicks) !== JSON.stringify(prev)) {
          const newRounds = Math.max(0, ...newPicks.map((p) => p.round)) + 1;
          setRounds(newRounds);
          setActivePick(getActivePick(newPicks));
          return newPicks;
        }
        return prev;
      });

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
        // If your hook doesn't pass the payload through yet,
        // change it so it forwards the server message.
        try {
          const { pickId, cardId } = msg || {};
          if (pickId) {
            // optimistic update immediately
            let nextPickNumber = -1;
            let nextPickRound = -1;
            let updatedPicks = picks.map((p) => {
              if (p.pick_id === pickId) {
                nextPickNumber =
                  p.pick_number === participants.length - 1
                    ? 0
                    : p.pick_number + 1;
                nextPickRound =
                  p.pick_number === participants.length - 1
                    ? p.round + 1
                    : p.round;
                return {
                  pick_id: p.pick_id,
                  draft_id: p.draft_id,
                  round: p.round,
                  player_id: p.player_id,
                  card_id: cardId,
                  pick_number: p.pick_number,
                };
              }
              if (
                p.pick_number === nextPickNumber &&
                p.round === nextPickRound
              ) {
                setActivePick(p);
              }
              return p;
            });
            setPicks(updatedPicks);
            setDeadlineAt(createPickDeadline(pickTime));
            fetchData();
          }
        } catch {
          fetchData();
        }
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
