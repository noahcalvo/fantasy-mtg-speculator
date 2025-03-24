'use client';
import React, { useState, useEffect } from 'react';
import { DraftPick, Player } from '@/app/lib/definitions';
import DraftPickCell from './draftPickCell';
import { getActivePick } from '@/app/lib/clientActions';
import { fetchDraft, fetchPicks } from '@/app/lib/draft';
import { notFound } from 'next/navigation';
import { fetchMultipleParticipantData } from '@/app/lib/player';

const DraftGrid = ({ draftId }: { draftId: number }) => {
  const [picks, setPicks] = useState<DraftPick[]>([]);
  const [participants, setParticipants] = useState<Player[]>([]);
  const [rounds, setRounds] = useState(0);
  const [activePick, setActivePick] = useState<DraftPick | undefined>(
    undefined,
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const newPicks = await fetchPicks(draftId);
        const draft = await fetchDraft(draftId);

        if (!draft) {
          notFound();
        }

        const participantIDs = draft.participants;
        const participantsData =
          await fetchMultipleParticipantData(participantIDs);

        setPicks((prevPicks) => {
          if (JSON.stringify(newPicks) !== JSON.stringify(prevPicks)) {
            const newRounds =
              Math.max(...newPicks.map((pick) => pick.round)) + 1;
            setRounds(newRounds);
            const newActivePick = getActivePick(newPicks);
            setActivePick(newActivePick);
            return newPicks;
          }
          return prevPicks;
        });

        setParticipants((prevParticipants) => {
          if (
            JSON.stringify(participantsData) !==
            JSON.stringify(prevParticipants)
          ) {
            return participantsData;
          }
          return prevParticipants;
        });
      } catch (error) {
        console.error(error);
      }
    };

    const interval = setInterval(fetchData, 20000);
    fetchData(); // Initial fetch

    return () => clearInterval(interval);
  }, [draftId]);

  return (
    <div className="overflow-auto rounded-lg border-2 border-white">
      <table className="table-fixed divide-y divide-white rounded-lg">
        <thead>
          <tr>
            {participants.map((participant, index) => (
              <th
                key={index}
                className="no-scrollbar text-responsive overflow-auto rounded-lg border-2 border-white bg-gray-950 px-1 py-2 text-center text-xs capitalize text-gray-50"
              >
                <div className="w-24">{participant.name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rounds }, (_, roundIndex) => (
            <tr key={roundIndex} className="space-y-2 border-2">
              {participants.map((participant, participantIndex) => {
                const pick = picks.find(
                  (pick) =>
                    pick.round === roundIndex &&
                    pick.player_id === participant.player_id,
                );
                const activePickNumber = activePick?.pick_number ?? 0;
                const activePickRound = activePick?.round ?? 0;
                const pickNumber = pick?.pick_number ?? 0;
                const pickRound = pick?.round ?? 0;
                const picksTilActive =
                  (pickRound - activePickRound) * participants.length -
                  activePickNumber +
                  pickNumber;
                return (
                  <DraftPickCell
                    pick={pick as DraftPick}
                    key={participantIndex}
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
