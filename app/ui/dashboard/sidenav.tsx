import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import { PowerIcon } from '@heroicons/react/24/outline';
import { auth, signOut } from '@/auth';
import SpecLogo from '../spec-logo';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { fetchLeagues } from '@/app/lib/leagues';
import { League } from '@/app/lib/definitions';
import { redirect } from 'next/navigation';

export default async function SideNav() {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email;
  let player = null;
  let playerId = null;
  if (userEmail) {
    player = await fetchPlayerByEmail(userEmail);
    playerId = player.player_id;
  }
  let joinedLeagues: League[] = [];
  if (playerId) {
    joinedLeagues = await fetchLeagues(playerId);
  }
  return (
    <div className="flex h-full flex-col pb-0">
      <Link
        className="mb-2 hidden h-28 items-end justify-start rounded-md bg-white text-gray-950 hover:text-red-900 md:flex md:h-40"
        href="/"
      >
        <div className="mb-2 ml-4 h-28 w-28 p-0 md:mb-8 md:ml-0 md:w-40">
          <SpecLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks joinedLeagues={joinedLeagues} playerId={playerId} />
        {player !== null ? (
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/login' });
            }}
          >
            <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md border border-black bg-gray-50 p-3 text-md font-medium hover:border-gray-50 hover:bg-red-800 hover:text-gray-50 md:flex-none md:justify-start md:p-2 md:px-3">
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Sign Out</div>
            </button>
          </form>
        ) : (
          // sign in button appears if player == null
          <Link href="/login">
            <div className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md border border-black bg-gray-50 p-3 text-md font-medium hover:border-gray-50 hover:bg-gray-800 hover:text-gray-50 md:flex-none md:justify-start md:p-2 md:px-3">
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Sign In</div>
            </div>
          </Link>
        )}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-950 text-md md:block"></div>
      </div>
    </div>
  );
}
