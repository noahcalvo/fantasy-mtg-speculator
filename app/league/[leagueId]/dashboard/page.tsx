import Roster from '@/app/ui/roster/roster';
import { auth } from '@/auth';
import TotalCardsBadge from './components/total-cards';
import BestPerformingBadge from './components/best-performer';
import MoreAboutScoring from './components/more-about-scoring';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { fetchPlayerCollectionWithDetails } from '@/app/lib/collection';
import { CardDetails, getRosterPositions } from '@/app/lib/definitions';
import { getCurrentWeek } from '@/app/lib/utils';
import Collection from '@/app/ui/roster/collection';
import { fetchScoringOptions } from '@/app/lib/leagues';
import { fetchCardPerformanceByWeek } from '@/app/lib/performance';
import { fetchPlayerRosterWithDetails } from '@/app/lib/rosters';

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
  const scoringRules = await fetchScoringOptions(leagueId);
  const roster = await fetchPlayerRosterWithDetails(playerId, leagueId);
  // make a cardID list of the cards on the roster
  let cardsOnRoster: number[] = [];
  const positions = getRosterPositions();
  for (const position of positions) {
    const cardId = roster[position.toLowerCase()]?.card_id;
    if (cardId) {
      cardsOnRoster.push(cardId);
    }
  }
  const benchCollection = collection.filter((card: CardDetails) => {
    return !cardsOnRoster.some((cardID: number) => {
      return cardID === card.card_id;
    });
  });

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
    <main className="p-4">
      <div className="mb-4 text-md font-semibold text-gray-950">
        <span className="md:text-lg">Your Collection</span>{' '}
        <span className="text-md font-semibold">at a Glance</span>
      </div>
      <div className="grid gap-2 xl:grid-cols-2">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
          <TotalCardsBadge playerId={player.player_id} leagueId={leagueId} />
          <BestPerformingBadge
            playerId={player.player_id}
            leagueId={leagueId}
          />
        </div>
        <MoreAboutScoring scoringInfo={scoringRules} />
      </div>
      <div className="mt-2 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="row-span-2 rounded-xl bg-gray-950 lg:row-start-1">
          <Roster
            playerId={player.player_id}
            owner={true}
            leagueId={leagueId}
            mostRecentPoints={mostRecentPoints}
            secondMostRecentPoints={secondMostRecentPoints}
            week={getCurrentWeek()}
          />
        </div>
        <div className="row-span-2 rounded-xl bg-gray-950 text-gray-50">
          <Collection
            playerId={player.player_id}
            leagueId={leagueId}
            benchCollection={benchCollection}
            mostRecentPoints={mostRecentPoints}
            secondMostRecentPoints={secondMostRecentPoints}
          />
        </div>
      </div>
    </main>
  );
}
