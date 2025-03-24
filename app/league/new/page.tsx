import { auth } from '@/auth';
import { fetchPlayerByEmail } from '../../lib/player';
import { League } from '../../lib/definitions';
import {
  fetchAllOpenLeagues,
  fetchLeagues,
} from '../../lib/leagues';
import JoinLeague from './../components/joinLeague';

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

  return (
    <div>
      <div>
        <JoinLeague leagues={allLeagues} userId={playerId} />
      </div>

      <footer className="p-4 text-center text-gray-50">
        <div className="h-32"></div>
      </footer>
    </div>
  );
}
