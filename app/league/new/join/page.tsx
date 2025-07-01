import { auth } from '@/auth';
import JoinLeague from './components/joinLeague';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { League } from '@/app/lib/definitions';
import { fetchAllOpenLeagues, fetchLeagues } from '@/app/lib/leagues';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  let joinedLeagues: League[] = [];
  if (playerId) {
    joinedLeagues = await fetchLeagues(playerId);
  }
  let allLeagues: League[] = [];
  const leagues = await fetchAllOpenLeagues();
  // filter out leagues that the user is already a part of
  const filteredLeagues = leagues?.filter((league) => {
    return !joinedLeagues.some(
      (joinedLeague) => joinedLeague.league_id === league.league_id,
    );
  });
  // add the filtered leagues to the allLeagues array
  allLeagues = allLeagues.concat(filteredLeagues ?? []);

  return <JoinLeague leagues={allLeagues} userId={playerId} />;
}
