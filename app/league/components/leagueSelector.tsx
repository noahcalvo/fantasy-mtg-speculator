'use client';
import { DarkNavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

export default function LeagueSelector({
  leagueId,
  children,
}: {
  leagueId: number;
  children?: React.ReactNode;
}) {  
    const pathname = usePathname()
  return (
    <div>
      <div className='flex mt-4'>
        <DarkNavTab name="Teams" path={`/league/${leagueId}/teams`} active={pathname === `/league/${leagueId}/teams`}/>
        <DarkNavTab name="Standings" path={`/league/${leagueId}/standings`} active={pathname === `/league/${leagueId}/standings`}/>
        <DarkNavTab name="Trade" path={`/league/${leagueId}/trade`} active={pathname === `/league/${leagueId}/trade`}/>
      </div>
      <div className='bg-white h-full text-black'>
            {children}
        </div>

    </div>
  );
}
