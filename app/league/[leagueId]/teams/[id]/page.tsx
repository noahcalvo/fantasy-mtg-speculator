import { fetchParticipantData } from "@/app/lib/player";
import Roster from "@/app/ui/roster/roster";
import { selectClasses } from "@mui/material";

export default async function Page({ params }: { params: { id: string } }) {
  const playerId = parseInt(params.id, 10);
  const playerData = await fetchParticipantData(isNaN(playerId) ? -1 : playerId)

  return (
      <div>
      <Roster playerId={playerId} name={playerData.name}/>
      </div>
  );
}