'use client';

import { useState, useMemo } from 'react';
import { League } from '@/app/lib/definitions';
import { joinLeague, joinPrivateLeague } from '@/app/lib/leagues';
import { PlusIcon } from '@heroicons/react/24/solid';

interface JoinLeagueProps {
  leagues: League[];
  userId?: number;
}

export default function JoinLeague({ leagues, userId }: JoinLeagueProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [invalidCode, setInvalidCode] = useState('');
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

  const handleJoinPrivate = async (inviteCode: string) => {
    if (!userId) return;
    if (!inviteCode || inviteCode.length !== 8) {
      setInvalidCode('Please enter a valid 8-digit invite code.');
      return;
    }
    try {
      const leagueId = await joinPrivateLeague(userId, inviteCode);
      if (leagueId === -1) {
        setInvalidCode('Code was invalid or expired.');
        return;
      }
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
      <section>
        <div className="mx-auto mb-16 w-80 text-gray-50">
          <h2 className="mb-4 text-center text-lg">Join Private League</h2>
          <input
            type="text"
            placeholder="Invite Code"
            value={inviteCode}
            onChange={(e) => {
              setInviteCode(e.target.value);
            }}
            className="my-4 w-full rounded-md border px-3 py-2 text-gray-950"
            maxLength={8}
          />
          {invalidCode && (
            <p className="mb-4 text-center text-sm text-red-500">
              {invalidCode || 'Please enter a valid invite code.'}
            </p>
          )}
          <button
            onClick={() => handleJoinPrivate(inviteCode)}
            className="mt-auto h-8 w-full rounded-md border border-black bg-gray-50 px-2 py-1 text-md text-gray-950 hover:bg-red-800 hover:text-gray-50"
          >
            Join
          </button>
        </div>
      </section>
      <section>
        <div className="mx-auto mb-8 w-80 text-gray-50">
          <h2 className="mb-4 text-center text-lg font-semibold text-gray-50">
            Public Leagues
          </h2>
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
        </div>
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
      </section>
    </div>
  );
}
