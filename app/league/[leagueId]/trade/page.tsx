'use server';
import { fetchPlayersInLeague } from '@/app/lib/leagues';
import { auth } from '@/auth';
import Trade from '../../components/trade';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { fetchPlayerCollectionWithDetails, fetchPlayerCollectionsWithDetails } from '@/app/lib/collection';
import { fetchTradeOffersWithDetails } from '@/app/lib/trade';
import TradeOffers from '../../components/tradeOffers';
import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: { leagueId: string } }) {
  const leagueId = isNaN(parseInt(params.leagueId, 10)) ? -1 : parseInt(params.leagueId, 10);
  const user = await auth().then((res) => res?.user);
  const teamsInLeague = await fetchPlayersInLeague(leagueId);
  const player = await fetchPlayerByEmail(user?.email ?? '')
  const playerId = player.player_id
  const teamsInLeagueWithoutYou = teamsInLeague.filter((teamPlayer) => teamPlayer.player_id !== playerId);

  const playerCollection = await fetchPlayerCollectionWithDetails(playerId, leagueId);
  const leagueCollections = await fetchPlayerCollectionsWithDetails(teamsInLeagueWithoutYou.map(player => player.player_id), leagueId)
  const tradeOffers = await fetchTradeOffersWithDetails(playerId, leagueId)
  // if player does not belong to the league, reroute to /league
  if (!teamsInLeague.find((teamPlayer) => teamPlayer.player_id === playerId))
    {redirect(`/league`)}
  // if there are no other teams in the league, show a message
  if (teamsInLeagueWithoutYou.length === 0)
    {return <div className="text-center py-8">No other teams in this league</div>}
  return (
    <main className="mb-4 p-2">
      <TradeOffers offers={tradeOffers} playerId={playerId} leagueId={leagueId}/>
      <Trade teamsInLeague={teamsInLeagueWithoutYou} player={player} playerCollection={playerCollection} leagueCollections={leagueCollections} leagueId={leagueId} />
    </main>
  );
}
