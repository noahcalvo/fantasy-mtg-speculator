'use client';
import { Player } from '@/app/lib/definitions';
import { LightNavTab } from '@/app/ui/nav-tab';
import { TeamPicker } from '@/app/ui/picker';
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
      <div className="hidden flex-row sm:flex">
        {teams.map((element: Player, index: number) => (
          <LightNavTab
            key={index}
            name={element.name}
            path={`/league/${leagueId}/teams/${element.player_id}`}
            active={
              pathname === `/league/${leagueId}/teams/${element.player_id}`
            }
          />
        ))}
      </div>
      <div className="mb-2 flex w-full flex-row sm:hidden">
        <TeamPicker teams={teams} leagueId={leagueId} />
      </div>
    </div>
  );
}
