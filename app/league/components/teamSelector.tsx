'use client';
import { Player } from '@/app/lib/definitions';
import { LightNavTab } from '@/app/ui/nav-tab';
import { usePathname } from 'next/navigation';

export default function TeamSelector({
  teams,
  leagueId,
}: {
  teams: Player[];
  leagueId: number;
}) {
  const pathname = usePathname();
  return (
    <div>
      <div className="flex flex-col sm:flex-row">
        {teams.map((element: Player, index: number) => (
          <LightNavTab
            key={index}
            name={element.name}
            path={`/league/${leagueId}/teams/${element.player_id}`}
            active={
              pathname === `/league/${leagueId}/teams/${element.player_id}`
            }
            stackVertically
          />
        ))}
      </div>
    </div>
  );
}
