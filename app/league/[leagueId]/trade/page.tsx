import { Player } from '@/app/lib/definitions';
import { fetchPlayersInLeague } from '@/app/lib/leagues';
import { auth } from '@/auth';
import Trade from '../../components/trade';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { fetchPlayerCollectionWithDetails, fetchPlayerCollectionWithPerformance, fetchPlayerCollectionsWithDetails } from '@/app/lib/collection';

export default async function Page({ params }: { params: { leagueId: string } }) {
  const leagueId = isNaN(parseInt(params.leagueId, 10)) ? -1 : parseInt(params.leagueId, 10);
  const user = await auth().then((res) => res?.user);
  const teamsInLeague = await fetchPlayersInLeague(leagueId);
  const player = await fetchPlayerByEmail(user?.email ?? '')
  const teamsInLeagueWithoutYou = teamsInLeague.filter((teamPlayer) => teamPlayer.player_id !== player.player_id);

  const playerCollection = await fetchPlayerCollectionWithDetails(player.player_id);
  const leagueCollections = await fetchPlayerCollectionsWithDetails(teamsInLeagueWithoutYou.map(player => player.player_id))
  // const playerCollectionPerformance = await fetchPlayerCollectionWithPerformance(player.player_id);


    return (
      <main className="mb-4 p-2 flex">
        <Trade teamsInLeague={teamsInLeagueWithoutYou} player={player} playerCollection={playerCollection} leagueCollections={leagueCollections}/>
      </main>
    );
  }
  