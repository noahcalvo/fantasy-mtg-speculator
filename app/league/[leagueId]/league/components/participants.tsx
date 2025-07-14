'use client';

import { Player } from '@/app/lib/definitions';
import { leaveLeague } from '@/app/lib/leagues';

// used to display league participant count, league name, and open/closed status
export default function Participants({
  leagueId,
  participants,
  playerId,
  isOtherCommissioner,
  isCommissioner = false,
}: {
  leagueId: number;
  participants: Player[];
  playerId: number;
  isOtherCommissioner: boolean;
  isCommissioner?: boolean;
}) {
  const handleLeaveLeague = async () => {
    try {
      await leaveLeague(leagueId, playerId);
      window.location.href = `/league/new`;
    } catch (error) {
      console.error('Error leaving league:', error);
    }
  };
  return (
    <div className="mb-4 rounded-xl bg-gray-950 p-4 text-gray-50">
      <h2 className="mx-2 mb-4 text-center text-md">Participants</h2>
      <div className="grid grid-cols-2 gap-4 text-gray-50 md:grid-cols-3 lg:grid-cols-4">
        {participants.map((participant) => (
          <div
            key={participant.player_id}
            className="flex flex-col justify-between rounded-lg border p-4 shadow-sm"
          >
            <h3 className="mb-2 text-sm font-semibold">
              {participant.name}
              <span className="mb-4 text-sm text-gray-500">
                {participant.player_id === playerId && ' (You)'}
              </span>
            </h3>

            {isCommissioner && participant.player_id !== playerId && (
              <button
                onClick={() => alert('feature not implemented yet')}
                className="mt-auto rounded-md border border-gray-50 px-2 py-1 text-sm text-gray-50 hover:bg-red-800 hover:text-gray-50"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      {isOtherCommissioner && (
        <div className="flex justify-center gap-4 px-8 py-4">
          <button
            className="flex items-center justify-center gap-2 rounded-sm border border-gray-50 bg-gray-950 px-3 py-1 text-md text-gray-50 hover:border-red-900 hover:text-red-900"
            onClick={() => handleLeaveLeague()}
          >
            👻 Leave League
          </button>
        </div>
      )}
    </div>
  );
}
