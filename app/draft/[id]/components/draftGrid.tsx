import { DraftPick, Player } from "@/app/lib/definitions";
import DraftPickCell from "./draftPickCell";
import { getActivePick } from "@/app/lib/clientActions";

export default function draftGrid ({ picks, participants }: { picks: DraftPick[], participants: Player[] }) {
    const rounds = Math.max(...picks.map(pick => pick.round)) + 1;
    const activePick = getActivePick(picks);

    return(
        <table className="min-w-full divide-y divide-white rounded-lg table-fixed">
        <thead>
          <tr>
            {participants.map((participant, index) => (
              <th key={index} className={`overflow-hidden w-32 text-responsive rounded-lg px-1 py-2 text-center text-white border-2 border-white ${index % 2 !== 0 ? 'bg-red-900' : 'bg-black'}`}>{participant.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rounds }, (_, roundIndex) => (
            <tr key={roundIndex} className="space-y-2 border-2">
              {participants.map((participant, participantIndex) => {
                const pick = picks.find(pick => pick.round + 1 === roundIndex + 1 && pick.player_id === participant.player_id);
                return (
                  <DraftPickCell pick={pick as DraftPick} key={participantIndex} active={pick==activePick}/>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>    
    )
}