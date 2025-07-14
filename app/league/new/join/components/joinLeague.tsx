'use client';

import { useState, useMemo } from 'react';
import { League } from '@/app/lib/definitions';
import { joinLeague } from '@/app/lib/leagues';
import { PlusIcon } from '@heroicons/react/24/solid';

interface JoinLeagueProps {
  leagues: League[];
  userId?: number;
}

export default function JoinLeague({ leagues, userId }: JoinLeagueProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // sort by descending member count
  const sortedLeagues = useMemo(
    () =>
      [...leagues].sort(
        (a, b) => (b.participants.length ?? 0) - (a.participants.length ?? 0),
      ),
    [leagues],
  );

  // filter by search term
  const filteredLeagues = useMemo(
    () =>
      sortedLeagues.filter((league) =>
        league.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [searchTerm, sortedLeagues],
  );

  const totalPages = Math.ceil(filteredLeagues.length / 10) || 1;
  const currentLeagues = useMemo(
    () => filteredLeagues.slice((currentPage - 1) * 10, currentPage * 10),
    [filteredLeagues, currentPage],
  );

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleJoin = async (leagueId: number) => {
    if (!userId) return;
    try {
      await joinLeague(userId, leagueId);
      // reload to reflect join
      window.location.href = `/league/${leagueId}/league`;
    } catch (error) {
      console.error('Join failed', error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-end">
        <a
          href="/league/new/create"
          className="flex items-center rounded-md border border-black bg-gray-50 px-4 py-2 text-sm font-medium text-gray-950"
        >
          <PlusIcon className="mr-1 inline-block h-4 w-4" />
          Create League
        </a>
      </div>
      <input
        type="text"
        placeholder="Search leagues"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        className="my-4 w-full rounded-md border px-3 py-2"
      />
      <div className="grid grid-cols-1 gap-4 text-gray-50 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {currentLeagues.map((league) => (
          <div
            key={league.league_id}
            className="flex flex-col justify-between rounded-lg border p-4 shadow-sm"
          >
            <h3 className="mb-2 text-md font-semibold">{league.name}</h3>
            <p className="mb-4 text-sm text-gray-500">
              {league.participants.length ?? 0} member
              {league.participants.length === 1 ? '' : 's'}
            </p>
            <button
              onClick={() => handleJoin(league.league_id)}
              className="mt-auto rounded-md border border-black bg-gray-50 px-2 py-1 text-sm text-gray-950 hover:bg-red-800 hover:text-gray-50"
            >
              Join
            </button>
          </div>
        ))}
      </div>
      {/* Pagination Controls */}
      <div className="mt-6 flex items-center justify-center space-x-4">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="rounded-md border bg-gray-50 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="rounded-md border bg-gray-50 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
