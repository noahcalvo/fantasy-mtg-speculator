import { DraftPick, Player } from '@/app/lib/definitions';
import DraftPickCell from './draftPickCell';
import { getActivePick } from '@/app/lib/clientActions';

export default function draftGrid({
  picks,
  participants,
}: {
  picks: DraftPick[];
  participants: Player[];
}) {
  const rounds = Math.max(...picks.map((pick) => pick.round)) + 1;
  const activePick = getActivePick(picks);
  return (
    <div className='border-2 border-white rounded-lg overflow-auto'>
    <table className="table-fixed divide-y divide-white rounded-lg">
      <thead>
        <tr>
          {participants.map((participant, index) => (
            <th
              key={index}
              className={`no-scrollbar rounded-lg border-2 border-white px-1 py-2 text-center text-responsive text-white bg-black capitalize text-xs overflow-auto`}
            >
              <div className='w-24'>
              {participant.name}
              </div>
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
              const picksTilActive = (pickRound - activePickRound) * participants.length - (activePickNumber) + (pickNumber);
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
}
