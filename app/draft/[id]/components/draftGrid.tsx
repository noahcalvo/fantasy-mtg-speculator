import { DraftPick, Player } from "@/app/lib/definitions";
import DraftPickCell from "./draftPickCell";
import { getActivePick } from "@/app/lib/clientActions";

export default function draftGrid ({ picks, participants }: { picks: DraftPick[], participants: Player[] }) {
    const rounds = Math.max(...picks.map(pick => pick.round)) + 1;
    const activePick = getActivePick(picks);

    return(
        <table className="table-auto divide-y divide-blue-200 flex-1 rounded-lg w-full">
        <thead>
          <tr>
            {participants.map((participant, index) => (
              <th key={index} className={`rounded-lg h-20 w-40 px-4 py-2 text-center text-white border-4 border-white ${index % 2 !== 0 ? 'bg-blue-500' : 'bg-black'}`}>{participant.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rounds }, (_, roundIndex) => (
            <tr key={roundIndex} className="space-y-4 border-5">
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