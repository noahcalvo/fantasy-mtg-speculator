'use client';
import { DarkNavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

export default function LeagueSelector({
  userId,
  children,
}: {
  userId: number;
  children?: React.ReactNode;
}) {  
    const pathname = usePathname()
  return (
    <div>
      <div className='flex mt-4'>
        <DarkNavTab name="Teams" path="/league/teams" active={pathname === "/league/teams"}/>
        <DarkNavTab name="Standings" path="/league/standings" active={pathname === "/league/standings"}/>
        <DarkNavTab name="Trade" path="/league/trade" active={pathname === "/league/trade"}/>
      </div>
      <div className='bg-white h-full text-black p-2'>
            {children}
        </div>

    </div>
  );
}
