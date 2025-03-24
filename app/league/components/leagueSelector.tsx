'use client';
import { League } from '@/app/lib/definitions';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function LeagueSelector({
  joinedLeagues,
}: {
  joinedLeagues: League[];
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // get the path and see if leagueid is already set
  const currentPath = usePathname();
  const currentLeagueId = currentPath.match(/\/league\/(\d+)/)?.[1];
  // turn leagueId into a number
  const currentLeagueIdNumber = currentLeagueId
    ? parseInt(currentLeagueId)
    : -1;
  const currentLeagueName = joinedLeagues.find(
    (league) => league.league_id === currentLeagueIdNumber,
  )?.name;

  return (
    <div className="relative">
      <button
        className="text-border-white font-bold text-red-900 underline"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >
        {currentLeagueName || 'Select League'}
      </button>
      {isDropdownOpen && (
        <div className="absolute mt-2 rounded bg-gray-800 p-2 shadow-lg">
          {joinedLeagues.map((league) => (
            <a
              key={league.league_id}
              href={`/league/${league.league_id}/standings`}
              className="block cursor-pointer rounded p-1 text-gray-50 hover:bg-gray-700"
            >
              {league.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
