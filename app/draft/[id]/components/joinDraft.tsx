'use client';

import { joinDraft } from '@/app/lib/draft';
import React from 'react';

interface JoinDraftProps {
  draftId: string;
  playerId: number;
  participants: Array<any>;
}

const JoinDraft: React.FC<JoinDraftProps> = ({
  draftId,
  playerId,
  participants,
}) => {
  return (
    <div className="mt-4">
      <button
        type="submit"
        className="rounded bg-white px-4 py-2 hover:bg-red-800 text-black hover:text-white border border-white"
        onClick={() => joinDraft(draftId, playerId)}
      >
        Join Draft
      </button>
      <span className="bg-white py-1 text-black border border-white ml-4 mr-1 rounded-full pr-[3px] pl-1">
                    {' '}{participants.length}{' '}
                  </span><span className='text-white'>participants</span>
    </div>
  );
};

export default JoinDraft;
