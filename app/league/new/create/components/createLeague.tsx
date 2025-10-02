'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateLeague({ playerId }: { playerId: number }) {
  const router = useRouter();
  const [leagueName, setLeagueName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!leagueName) {
      setError('Please enter a league name.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leagueName, userId: playerId, isPrivate }),
      });
      const data = await r.json();
      if (!r.ok || !data.ok)
        throw new Error(data.error || 'Failed to create league');
      router.push(`/league/${data.leagueId}/league`);
    } catch (e: any) {
      setError(e?.message || 'Failed to create league. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute left-0 w-full flex-col items-center justify-center gap-8 px-8 py-32 md:relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleCreate();
        }}
        className="mx-auto flex max-w-lg flex-col gap-8"
      >
        <h2 className="text-center text-lg font-semibold text-gray-50">
          Create a league ✨
        </h2>
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-sm text-zinc-400">
            League name
          </label>
          <input
            id="name"
            value={leagueName}
            onChange={(e) => setLeagueName(e.target.value)}
            placeholder="Enter league name"
            className="text-md rounded-md border-gray-50 bg-gray-50 px-4 py-2 text-gray-950 focus-visible:ring-red-900"
          />
        </div>
        <p className="text-sm text-red-500">{error}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <label
              htmlFor="private-mode"
              className="text-md font-semibold text-gray-50"
            >
              Private league
            </label>
            <p className="text-sm text-gray-100">
              Only people with an invite code can join
            </p>
          </div>
          <input
            type="checkbox"
            id="private-mode"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-5 w-5 shadow-none ring-0 hover:cursor-pointer"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-red-900 px-4 py-2 text-gray-50 hover:cursor-pointer hover:bg-red-950"
          disabled={loading}
        >
          {loading ? 'Creating…' : 'Create'} League
        </button>
      </form>
    </div>
  );
}
