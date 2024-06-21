'use client';
import { DarkNavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

export default function LeagueSelector({
  leagueId,
  playerId,
  children,
}: {
  leagueId: number;
  playerId: number;
  children?: React.ReactNode;
}) {
  const pathname = usePathname()
  const leagueMatch = new RegExp(`/league/${leagueId}/teams(/.*)?`).test(pathname);
  return (
    <div>
      <div className='flex mt-4'>
        <DarkNavTab name="Teams" path={`/league/${leagueId}/teams/${playerId}`} active={leagueMatch} />
        <DarkNavTab name="Standings" path={`/league/${leagueId}/standings`} active={pathname === `/league/${leagueId}/standings`} />
        <DarkNavTab name="Trade" path={`/league/${leagueId}/trade`} active={pathname === `/league/${leagueId}/trade`} />
        <DarkNavTab name="Bulletin" path={`/league/${leagueId}/bulletin`} active={pathname === `/league/${leagueId}/bulletin`} />
      </div>
      <div className='bg-white h-full text-black'>
        {children}
      </div>

    </div>
  );
}
