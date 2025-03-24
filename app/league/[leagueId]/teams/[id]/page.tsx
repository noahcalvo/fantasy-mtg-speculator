import { fetchParticipantData } from '@/app/lib/player';
import Roster from '@/app/ui/roster/roster';

export default async function Page({
  params,
}: {
  params: { id: string; leagueId: string };
}) {
  const playerId = parseInt(params.id, 10);
  const leagueId = parseInt(params.leagueId);
  const playerData = await fetchParticipantData(
    isNaN(playerId) ? -1 : playerId,
  );

  return (
    <div className="bg-gray-950">
      <Roster
        playerId={playerId}
        leagueId={leagueId}
        multiColumn={true}
        name={playerData?.name}
      />
    </div>
  );
}
