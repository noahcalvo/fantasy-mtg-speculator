import { fetchParticipantData } from '@/app/lib/player';
import Roster from '@/app/ui/roster/roster';

export default async function Page({ params }: { params: { id: string } }) {
  const playerId = parseInt(params.id, 10);
  const playerData = await fetchParticipantData(
    isNaN(playerId) ? -1 : playerId,
  );

  return (
    <div className="bg-gray-950">
      <Roster playerId={playerId} name={playerData.name} multiColumn={true} />
    </div>
  );
}
