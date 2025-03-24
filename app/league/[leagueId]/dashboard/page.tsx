import Roster from '@/app/ui/roster/roster';
import { auth } from '@/auth';
import TotalCardsBadge from './components/total-cards';
import BestPerformingBadge from './components/best-performer';
import MoreAboutScoring from './components/more-about-scoring';
import { fetchPlayerByEmail } from '@/app/lib/player';
import {
  fetchCardPerformanceByWeek,
  fetchPlayerCollectionWithDetails,
} from '@/app/lib/collection';
import { CardDetails } from '@/app/lib/definitions';
import { getCurrentWeek } from '@/app/lib/utils';
import Collection from '@/app/ui/roster/collection';

export default async function Page({
  params,
}: {
  params: { leagueId: string };
}) {
  const leagueId = parseInt(params.leagueId);
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const collection = await fetchPlayerCollectionWithDetails(playerId, leagueId);

  const collectionIds = collection.map((card: CardDetails) => card.card_id);

  const mostRecentPoints = await fetchCardPerformanceByWeek(
    collectionIds,
    getCurrentWeek(),
  );
  const secondMostRecentPoints = await fetchCardPerformanceByWeek(
    collectionIds,
    getCurrentWeek() - 1,
  );

  return (
    <main className="p-2">
      <div className="mb-4 text-2xl text-gray-950 md:text-3xl">Dashboard</div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <TotalCardsBadge playerId={player.player_id} leagueId={leagueId} />
          <BestPerformingBadge
            playerId={player.player_id}
            leagueId={leagueId}
          />
        </div>
        <MoreAboutScoring />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="row-span-2 rounded-xl bg-gray-950 lg:col-span-2 lg:col-start-2 lg:row-start-1">
          <Roster
            playerId={player.player_id}
            owner={true}
            leagueId={leagueId}
          />
        </div>
        <div className="col-start-1 row-span-2 rounded-xl bg-gray-950">
          <Collection
            playerId={player.player_id}
            leagueId={leagueId}
            collection={collection}
            mostRecentPoints={mostRecentPoints}
            secondMostRecentPoints={secondMostRecentPoints}
          />
        </div>
      </div>
    </main>
  );
}
