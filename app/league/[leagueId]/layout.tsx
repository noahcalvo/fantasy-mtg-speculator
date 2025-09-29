import { auth } from '@/auth';
import { fetchPlayerByEmail } from '../../lib/player';
import LeagueMenu from './../components/leagueMenu';

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

  return (
    <div className="flex h-[calc(100vh-114px-env(safe-area-inset-top))] w-full flex-col overflow-auto md:h-full">
      {/* 🚩 STICKY TOP BAR */}
      <div className="sticky top-0 border-b-2 border-gray-50 md:top-0">
        <LeagueMenu leagueId={leagueId} playerId={playerId} />
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
