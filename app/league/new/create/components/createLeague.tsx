'use client';
import { createLeague } from '@/app/lib/leagues';
import { useState } from 'react';

export default function CreateLeague({ playerId }: { playerId: number }) {
  const [leagueName, setLeagueName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = async () => {
    if (leagueName === '') {
      alert('Please enter a league name.');
      return;
    }
    const leagueID = await createLeague(leagueName, playerId, isPrivate);
    // Redirect to the new league page after creation
    window.location.href = `/league/${leagueID}/league`;
  };

  return (
    <div className="absolute left-0 w-full flex-col items-center justify-center gap-8 px-8 py-32 md:relative">
      <form onSubmit={handleCreate} className="flex flex-col gap-8">
        <h2 className="text-center text-lg font-semibold text-gray-50">
          Your new league ✨
        </h2>
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-sm font-semibold text-zinc-400">
            League name
          </label>
          <input
            id="name"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            placeholder="Enter league name"
            className="border-zinc-700 bg-zinc-800 text-gray-50 focus-visible:ring-yellow-400"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <label
              htmlFor="private-mode"
              className="text-sm font-semibold text-zinc-400"
            >
              Private league
            </label>
            <p className="text-xs text-zinc-500">
              Only people with an invite code can join
            </p>
          </div>
          <input
            type="checkbox"
            id="private-mode"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-5 w-5 shadow-none ring-0"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-red-900 px-4 py-2 text-gray-50 hover:bg-red-950"
        >
          Create League
        </button>
      </form>
    </div>
  );
}
