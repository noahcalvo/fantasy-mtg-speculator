import { Player } from '@/app/lib/definitions';
import { fetchPlayersInLeague } from '@/app/lib/leagues';
import { auth } from '@/auth';
import Trade from '../../components/trade';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { fetchPlayerCollectionWithDetails, fetchPlayerCollectionWithPerformance, fetchPlayerCollectionsWithDetails } from '@/app/lib/collection';
import PendingOffers from '../../components/pendingOffers';
import { fetchTradeOffers } from '@/app/lib/trade';

export default async function Page({ params }: { params: { leagueId: string } }) {
  const leagueId = isNaN(parseInt(params.leagueId, 10)) ? -1 : parseInt(params.leagueId, 10);
  const user = await auth().then((res) => res?.user);
  const teamsInLeague = await fetchPlayersInLeague(leagueId);
  const player = await fetchPlayerByEmail(user?.email ?? '')
  const playerId = player.player_id
  const teamsInLeagueWithoutYou = teamsInLeague.filter((teamPlayer) => teamPlayer.player_id !== playerId);

  const playerCollection = await fetchPlayerCollectionWithDetails(playerId);
  const leagueCollections = await fetchPlayerCollectionsWithDetails(teamsInLeagueWithoutYou.map(player => player.player_id))
  const pendingRecipientOffers = await fetchTradeOffers(playerId)
  console.log("offers:", pendingRecipientOffers)
  return (
    <main className="mb-4 p-2">
      <PendingOffers />
      <Trade teamsInLeague={teamsInLeagueWithoutYou} player={player} playerCollection={playerCollection} leagueCollections={leagueCollections} leagueId={leagueId} />
    </main>
  );
}
