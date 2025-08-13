'use client';

import { joinDraft } from '@/app/lib/draft';

interface JoinDraftProps {
  draftId: number;
  playerId: number;
  participants: Array<any>;
  leagueId: number;
}

const JoinDraft: React.FC<JoinDraftProps> = ({
  draftId,
  playerId,
  participants,
  leagueId,
}) => {
  return (
    <div className="mx-2 mt-4">
      <button
        type="submit"
        className="rounded border-2 border-gray-950 bg-red-900 px-4 py-2 text-gray-50 hover:bg-red-800 hover:text-gray-50"
        onClick={() => joinDraft(draftId, playerId, leagueId)}
      >
        Join Draft
      </button>
      <span className="ml-4 mr-2 rounded-full border border-gray-950 bg-gray-50 py-1 pl-1 pr-[3px] text-gray-950">
        {' '}
        {participants.length}{' '}
      </span>
      <span className="text-gray-950">participants</span>
    </div>
  );
};

export default JoinDraft;
