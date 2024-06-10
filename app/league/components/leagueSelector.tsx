'use client';
import { NavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

export default function LeagueSelector({
  user,
  children,
}: {
  user: any;
  children?: React.ReactNode;
}) {  
    const pathname = usePathname()
  return (
    <div>
      <h1>League Selector</h1>
      <div className='flex'>
        <NavTab name="Teams" path="/league/teams" active={pathname === "/league/teams"}/>
        <NavTab name="Standings" path="/league/standings" active={pathname === "/league/standings"}/>
        <NavTab name="Trade" path="/league/trade" active={pathname === "/league/trade"}/>
      </div>
      <div className='bg-white h-full text-black'>
            {children}
        </div>

    </div>
  );
}
