import { Draft } from '@/app/lib/definitions';
import React from 'react';

export default function DraftInfoHeader({ draft }: { draft: Draft }) {
  return (
    <div className="rounded-lg border border-blue-500 p-5 text-blue-500 shadow-md">
      <h1 className="mb-4 text-2xl font-bold md:text-3xl">
        {draft.name}:
        <span className="mb-4 text-lg md:text-xl">
          {' '}
          A <span className="font-semibold">{draft.rounds}</span> round{' '}
          <i className="font-medium">{draft.set}</i> draft
        </span>
      </h1>
    </div>
  );
};