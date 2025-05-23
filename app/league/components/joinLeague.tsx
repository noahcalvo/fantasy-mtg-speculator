'use client';
import { League } from '@/app/lib/definitions';
import { createLeague, joinLeague } from '@/app/lib/leagues';
import { useState } from 'react';

export default function JoinLeague({
  leagues,
  userId,
}: {
  leagues: League[];
  userId: number;
}) {
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const select = form.elements.namedItem('leagueId') as HTMLSelectElement;
    const selectedLeagueId = parseInt(select.value, 10);
    joinLeague(userId, isNaN(selectedLeagueId) ? -1 : selectedLeagueId);
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem('leagueName') as HTMLInputElement;
    createLeague(input.value, userId);
  };

  return (
    <div>
      <div className="mb-4 flex justify-center">
        <button
          onClick={() => {
            setShowJoin(true);
            setShowCreate(false);
          }}
          className="m-2 rounded-md border border-black bg-gray-50  px-2 py-1 text-sm text-gray-950 hover:bg-red-800 hover:text-gray-50"
        >
          Join League
        </button>
        <button
          onClick={() => {
            setShowCreate(true);
            setShowJoin(false);
          }}
          className="m-2 rounded-md border border-black bg-gray-50  px-2 py-1 text-sm text-gray-950 hover:bg-red-800 hover:text-gray-50"
        >
          Create League
        </button>
      </div>
      <div className="flex justify-center">
        {showJoin && (
          <div>
            <form onSubmit={handleJoin}>
              <select name="leagueId">
                <option value="" disabled>
                  Select a league
                </option>
                {leagues.map((league: League) => (
                  <option key={league.league_id} value={league.league_id}>
                    {league.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="m-2 rounded-md border border-black bg-gray-50  px-2 py-1 text-sm text-gray-950 hover:bg-red-800 hover:text-gray-50"
              >
                Join
              </button>
            </form>
          </div>
        )}
        {showCreate && (
          <div>
            <form onSubmit={handleCreate}>
              <input type="text" placeholder="League Name" name="leagueName" />
              <button
                type="submit"
                className="m-2 rounded-md border border-black bg-gray-50  px-2 py-1 text-sm text-gray-950 hover:bg-red-800 hover:text-gray-50"
              >
                Create
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
