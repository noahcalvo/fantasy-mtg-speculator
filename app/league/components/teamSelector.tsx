'use client';
import { NavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

export default function TeamSelector() {  
    const pathname = usePathname()
  return (
    <div>
      <h1>Select a team</h1>
      <div className='flex'>
        <NavTab name="Teams" path="/league/teams" active={pathname === "/league/teams"}/>
        <NavTab name="Standings" path="/league/standings" active={pathname === "/league/standings"}/>
        <NavTab name="Trade" path="/league/trade" active={pathname === "/league/trade"}/>
      </div>
      <div className='bg-white h-full text-black'>
        </div>

    </div>
  );
}
