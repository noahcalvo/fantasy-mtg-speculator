import { auth } from '@/auth';
import { fetchPlayerByEmail } from '../lib/player';
import { fetchLeagues } from '../lib/leagues';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const player = await fetchPlayerByEmail(user?.email ?? '');
  const playerId = player.player_id;
  const leagues = await fetchLeagues(playerId);
  return <main className=""></main>;
}
