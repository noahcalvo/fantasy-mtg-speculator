import { Draft } from '@/app/lib/definitions';
import { fetchDrafts } from '@/app/lib/draft';
import Link from 'next/link';
import { DraftPill } from './draftPill';

export const DraftList = async ({leagueId}:{leagueId: number}) => {
  const drafts = await fetchDrafts(leagueId);
  const activeDrafts = drafts.filter((draft: Draft) => draft.active);
  const previousDrafts = drafts.filter((draft: Draft) => !draft.active);
  return (
    <div className="mt-4 p-4">
      <h2 className="text-xl md:text-2xl mb-4 text-white">Active Drafts</h2>
      <ul className="space-y-2">
        {activeDrafts.map((draft: Draft, key) => (
          <DraftPill key={key} draft={draft} />
        ))}
      </ul>{' '}
      <h2 className="text-xl md:text-2xl mb-4 mt-4 text-white">
        Previous Drafts
      </h2>
      <ul className="space-y-2">
        {previousDrafts.map((draft: Draft, key) => (
          <DraftPill key={key} draft={draft} />
        ))}
      </ul>
    </div>
  );
};
