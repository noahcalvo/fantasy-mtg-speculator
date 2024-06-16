'use client';
import { Player } from '@/app/lib/definitions';
import { LightNavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

export default function TeamSelector({ teams }: { teams: Player[] }) {
  const pathname = usePathname();
  return (
    <div>
      <h1>Teams</h1>
      <div className="flex flex-col sm:flex-row">
      {teams.map((element: Player, index: number) => (
        <LightNavTab
          key={index}
          name={element.name}
          path={`/league/teams/${element.player_id}`}
          active={pathname === `/league/teams/${element.player_id}`}
        />
      ))}
      </div>
      <div className="h-full bg-white text-black"></div>
    </div>
  );
}
