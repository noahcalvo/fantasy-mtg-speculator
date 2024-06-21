import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { auth, signOut } from '@/auth';
import SpecLogo from '../spec-logo';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { fetchLeague } from '@/app/lib/leagues';

export default async function SideNav() {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  let joinedLeague = null;
  if (playerId) {
    joinedLeague = await fetchLeague(playerId);
  }

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-28 items-end justify-start rounded-md bg-white md:h-40"
        href="/"
      >
        <div className="w-28 h-28 mb-2 ml-4 p-0 text-white md:w-40 md:mb-8 md:ml-0">
          <SpecLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks leagueId={joinedLeague?.league_id} playerId={playerId} />
        <div className="hidden h-auto w-full grow rounded-md bg-black md:block"></div>
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md border-black bg-white p-3 text-sm border font-medium hover:bg-red-800 hover:text-white hover:border-white md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
