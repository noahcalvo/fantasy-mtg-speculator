import { auth } from '@/auth';
import CreateLeague from './components/createLeague';
import { fetchPlayerByEmail } from '@/app/lib/player';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;

  return <CreateLeague playerId={playerId} />;
}
