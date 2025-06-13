import { fetchBulletinItems } from '@/app/lib/bulletin';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { auth } from '@/auth';
import BulletinBoard from './components/bulletinBoard';
import PostMessage from './components/postMessage';
import { fetchPlayersInLeague } from '@/app/lib/leagues';
import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: { leagueId: string };
}) {
  const leagueId = isNaN(parseInt(params.leagueId, 10))
    ? -1
    : parseInt(params.leagueId, 10);
  const user = await auth().then((res) => res?.user);
  const player = await fetchPlayerByEmail(user?.email ?? '');
  const playerId = player.player_id;
  const teamsInLeague = await fetchPlayersInLeague(leagueId);
  if (!teamsInLeague.find((teamPlayer) => teamPlayer.player_id === playerId)) {
    redirect(`/league`);
  }

  const bulletins = await fetchBulletinItems(leagueId);

  return (
    <div className="p-4">
      <BulletinBoard bulletins={bulletins} playerId={playerId} />
      <PostMessage playerId={playerId} leagueId={leagueId} />
    </div>
  );
}
