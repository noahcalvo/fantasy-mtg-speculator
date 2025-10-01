'use client';

import { League } from '@/app/lib/definitions';
import { HomeIcon, BoltIcon } from '@heroicons/react/24/outline';
import { ChevronRightIcon, PlusIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function NavLinks({
  joinedLeagues,
}: {
  joinedLeagues: League[];
  playerId: number | null;
}) {
  const pathname = usePathname();
  const leagueIdMatch = pathname.match(/\/league\/(\d+)/);
  const leagueId = leagueIdMatch ? parseInt(leagueIdMatch[1]) : null;
  const leagueMatchObj = joinedLeagues.find(
    (league) => league.league_id === leagueId,
  );

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const closeDropdown = () => setIsDropdownOpen(false);

  const handleLeagueClick = () => {
    closeDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <Link
        key={'Home'}
        href={'/dashboard'}
        className={clsx(
          'text-md flex h-[48px] grow items-center justify-center gap-2 rounded-md border p-3 font-medium hover:border-gray-50 hover:bg-red-800 hover:text-gray-50 md:flex-none md:justify-start md:p-2 md:px-3',
          {
            'border-gray-50 bg-gray-950 text-gray-50':
              pathname === '/dashboard',
            'border-black bg-gray-50 text-gray-950': pathname !== '/dashboard',
          },
        )}
      >
        <HomeIcon className="w-6" />
        <p className="hidden md:block">Home</p>
      </Link>
      <div className="relative w-full" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className={clsx(
            'text-md flex h-[48px] w-full items-center justify-center gap-2 rounded-md border p-3 font-medium hover:border-gray-50 hover:bg-red-800 hover:text-gray-50 md:flex-none md:justify-start md:p-2 md:px-3',
            {
              'border-gray-50 bg-gray-950 text-gray-50':
                pathname.includes('/league'),
              'border-black bg-gray-50 text-gray-950':
                !pathname.includes('/league'),
            },
          )}
        >
          <BoltIcon className="w-6" />
          <p className="md:block">
            {leagueMatchObj
              ? leagueMatchObj.name
              : pathname === '/league/new'
                ? 'League'
                : 'League'}
          </p>
          <ChevronRightIcon
            className={clsx('ml-auto w-5 transition-transform', {
              'rotate-90': isDropdownOpen,
            })}
          />
        </button>
        {isDropdownOpen && (
          <div className="absolute mt-2 w-full space-y-2 md:relative">
            {joinedLeagues.map((league) => (
              <Link
                key={league.league_id}
                href={`/league/${league.league_id}/dashboard`}
                onClick={handleLeagueClick}
                className={clsx(
                  'text-md z-60 ml-2 flex h-[48px] items-center justify-start gap-2 rounded-md border p-3 font-medium shadow-lg shadow-gray-950 hover:border-gray-50 hover:bg-red-800 hover:text-gray-50 md:flex-none md:p-2 md:px-3',
                  {
                    'border-gray-50 bg-gray-950 text-gray-50':
                      leagueId === league.league_id,
                    'border-black bg-gray-50 text-gray-950':
                      leagueId !== league.league_id,
                  },
                )}
              >
                {league.name}
              </Link>
            ))}
            <Link
              key={'NewLeague'}
              href={`/league/new`}
              onClick={handleLeagueClick}
              className={clsx(
                'text-md ml-2 flex h-[48px] items-center justify-start gap-2 rounded-md border bg-gray-50 p-3 font-medium hover:border-gray-50 hover:bg-red-800 hover:text-gray-50 md:flex-none md:p-2 md:px-3',
                {
                  'border-gray-50 bg-gray-950 text-gray-50':
                    pathname === '/league/new',
                  'border-black bg-gray-50 text-gray-950':
                    pathname !== '/league/new',
                },
              )}
            >
              <PlusIcon className="w-6" />
              New League
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
