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
    const interval = setInterval(() => {
      fetchPicks(draftId)
        .then((newPicks) => {
          if (JSON.stringify(newPicks) !== JSON.stringify(picks)) {
            setPicks(newPicks);
            const newRounds =
              Math.max(...newPicks.map((pick) => pick.round)) + 1;
            if (newRounds !== rounds) {
              setRounds(newRounds);
            }
            const newActivePick = getActivePick(newPicks);
            if (
              newActivePick?.pick_number !== activePick?.pick_number ||
              newActivePick?.round !== activePick?.round
            ) {
              setActivePick(newActivePick);
            }
          }
        })
        .catch((error) => {
          console.error(error);
        });
      fetchDraft(draftId)
        .then((draft) => {
          if (!draft) {
            notFound();
          }

          const participantIDs = draft.participants;
          fetchMultipleParticipantData(participantIDs)
            .then((participantsData) => {
              if (
                JSON.stringify(participantsData) !==
                JSON.stringify(participants)
              ) {
                setParticipants(participantsData);
              }
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch((error) => {
          console.error(error);
        });
    }, 2000);

    return () => clearInterval(interval);
  }, [draftId, picks, rounds, activePick, participants]);
  return (
    <div className="overflow-auto rounded-lg border-2 border-white">
      <table className="table-fixed divide-y divide-white rounded-lg">
        <thead>
          <tr>
            {participants.map((participant, index) => (
              <th
                key={index}
                className="no-scrollbar text-responsive overflow-auto rounded-lg border-2 border-white bg-black px-1 py-2 text-center text-xs capitalize text-white"
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
