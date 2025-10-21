import { auth } from '@/auth';
import { fetchPlayerByEmail } from '../../lib/player';
import LeagueMenu from './../components/leagueMenu';
import { isPlayerInLeague } from '@/app/lib/leagues';
import { redirect } from 'next/navigation';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    leagueId: string;
  };
}) {
  const leagueId = parseInt(params.leagueId);
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const isValidUser = await isPlayerInLeague(playerId, leagueId);
  if (!isValidUser) {
    redirect('/league/new');
  }

  return (
    <div className="flex h-[calc(100dvh-112px)] w-full flex-col md:h-[calc(100dvh-32px)]">
      <div className="sticky top-0 z-20 border-b-2 border-gray-50 bg-gray-950">
        <LeagueMenu leagueId={leagueId} playerId={playerId} />
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto bg-gray-50 pb-[env(safe-area-inset-bottom)]">
        {children}
      </main>
    </div>
  );
}
