'use client';
import { DarkNavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

const standingsUrlRegex = /^\/league\/\d+\/standings(?:\/\d+)?$/;

export default function LeagueMenu({
  leagueId,
  playerId,
  children,
}: {
  leagueId: number;
  playerId: number;
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const leagueMatch = new RegExp(`/league/${leagueId}/teams(/.*)?`).test(
    pathname,
  );
  return (
    <div>
      <div className="mt-4 flex max-w-full overflow-x-auto">
        <DarkNavTab
          name="My Team"
          path={`/league/${leagueId}/dashboard`}
          active={pathname === `/league/${leagueId}/dashboard`}
        />
        <DarkNavTab
          name="Teams"
          path={`/league/${leagueId}/teams/${playerId}`}
          active={leagueMatch}
        />
        <DarkNavTab
          name="Standings"
          path={`/league/${leagueId}/standings`}
          active={standingsUrlRegex.test(pathname)}
        />
        <DarkNavTab
          name="Trade"
          path={`/league/${leagueId}/trade`}
          active={pathname === `/league/${leagueId}/trade`}
        />
        <DarkNavTab
          name="Bulletin"
          path={`/league/${leagueId}/bulletin`}
          active={pathname === `/league/${leagueId}/bulletin`}
        />
      </div>
      <div className="h-full bg-gray-50 text-gray-950">{children}</div>
    </div>
  );
}
