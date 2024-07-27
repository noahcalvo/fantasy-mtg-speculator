'use client';

import { joinDraft } from '@/app/lib/draft';

interface JoinDraftProps {
  draftId: number;
  playerId: number;
  participants: Array<any>;
}

const JoinDraft: React.FC<JoinDraftProps> = ({
  draftId,
  playerId,
  participants,
}) => {
  return (
    <div className="mx-2 mt-4">
      <button
        type="submit"
        className="rounded border border-white bg-white px-4 py-2 text-black hover:bg-red-800 hover:text-white"
        onClick={() => joinDraft(draftId, playerId)}
      >
        Join Draft
      </button>
      <span className="ml-4 mr-1 rounded-full border border-white bg-white py-1 pl-1 pr-[3px] text-black">
        {' '}
        {participants.length}{' '}
      </span>
      <span className="text-white">participants</span>
    </div>
  );
};

export default JoinDraft;
