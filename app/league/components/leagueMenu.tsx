'use client';
import { DarkNavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

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
  const teamsMatch = new RegExp(`/league/${leagueId}/teams(/.*)?`).test(
    pathname,
  );
  const draftMatch = new RegExp(`/league/${leagueId}/draft(/.*)?`).test(
    pathname,
  );
  const standingsMatch = new RegExp(
    `/league/${leagueId}/standings(/(alltime|\\d+))?/?$`,
  ).test(pathname);
  return (
    <div className="sticky top-0 z-30">
      <div className="flex max-w-full overflow-x-auto">
        <DarkNavTab
          name="My Team"
          path={`/league/${leagueId}/dashboard`}
          active={pathname === `/league/${leagueId}/dashboard`}
        />
        <DarkNavTab
          name="Standings"
          path={`/league/${leagueId}/standings`}
          active={standingsMatch}
        />
        <DarkNavTab
          name="Draft"
          path={`/league/${leagueId}/draft`}
          active={draftMatch}
        />
        <DarkNavTab
          name="League Settings"
          path={`/league/${leagueId}/league`}
          active={pathname === `/league/${leagueId}/league`}
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
        <DarkNavTab
          name="Teams"
          path={`/league/${leagueId}/teams/${playerId}`}
          active={teamsMatch}
        />
      </div>
      <div className="bg-gray-50 text-gray-950">{children}</div>
    </div>
  );
}
