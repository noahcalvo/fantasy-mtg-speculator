import { fetchPlayerCollectionWithDetails } from '@/app/lib/collection';
import { CardDetails } from '@/app/lib/definitions';
import { fetchCardPerformanceByWeek } from '@/app/lib/performance';
import { fetchParticipantData } from '@/app/lib/player';
import { getCurrentWeek } from '@/app/lib/utils';
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

  const collection = await fetchPlayerCollectionWithDetails(playerId, leagueId);

  const collectionIds = collection.map((card: CardDetails) => card.card_id);

  const mostRecentPoints = await fetchCardPerformanceByWeek(
    collectionIds,
    leagueId,
    getCurrentWeek(),
  );
  const secondMostRecentPoints = await fetchCardPerformanceByWeek(
    collectionIds,
    leagueId,
    getCurrentWeek() - 1,
  );

  return (
    <div className="bg-gray-950">
      <Roster
        playerId={playerId}
        leagueId={leagueId}
        multiColumn={true}
        mostRecentPoints={mostRecentPoints}
        secondMostRecentPoints={secondMostRecentPoints}
        week={getCurrentWeek()}
      />
    </div>
  );
}
