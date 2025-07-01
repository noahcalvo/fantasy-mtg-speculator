'use client';
import { League } from '@/app/lib/definitions';
import { joinLeague } from '@/app/lib/leagues';

export default function JoinLeague({
  leagues,
  userId,
}: {
  leagues: League[];
  userId: number;
}) {
  const handleJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const select = form.elements.namedItem('leagueId') as HTMLSelectElement;
    const selectedLeagueId = parseInt(select.value, 10);
    joinLeague(userId, isNaN(selectedLeagueId) ? -1 : selectedLeagueId);
  };
  return (
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
  );
}
