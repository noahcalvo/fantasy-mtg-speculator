import { auth } from '@/auth';
import TeamSelector from '../components/teamSelector';
import { fetchAllLeagues, fetchLeague } from '@/app/lib/leagues';
import { League } from '@/app/lib/definitions';
import JoinLeague from '../components/joinLeague';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  let joinedLeague = null;
  if (user?.email) {
    joinedLeague = await fetchLeague(user.email);
  }
  let allLeagues: League[] = []
  if (!joinedLeague) {
    const leagues = await fetchAllLeagues()
    allLeagues.concat(leagues ?? []);
  }
  return (
    <main className="mb-4 p-2">
      {joinedLeague ? (
        <div>
          <TeamSelector />
        </div>
      ) : (
        <div>
          <p className="text-center">{user?.name} does not belong to any league</p>
          <JoinLeague leagues={allLeagues} />
        </div>
      )}
    </main>
  );
}
