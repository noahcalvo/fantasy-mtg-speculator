import '@/app/ui/global.css';
import { auth } from '@/auth';
import { fetchPlayerByEmail } from './lib/player';
import { fetchLeagues } from './lib/leagues';
import LeagueSelector from './league/components/leagueSelector';
import SideNav from './ui/dashboard/sidenav';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth().then((res) => res?.user);
  const userName = user?.name || '';
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const leagues = await fetchLeagues(playerId);

  return (
    <html lang="en" className="bg-gray-950">
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <body>
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
          <div className="w-full flex-none md:w-64">
            <SideNav />
          </div>
          <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
