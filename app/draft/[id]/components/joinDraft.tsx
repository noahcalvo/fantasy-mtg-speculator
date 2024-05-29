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
        className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        onClick={() => joinDraft(draftId, playerId)}
      >
        Join Draft
      </button>
      <span className="text-lg text-blue-500 md:text-xl">
        {' '}{participants.length} drafters
      </span>
    </div>
  );
};

export default JoinDraft;
