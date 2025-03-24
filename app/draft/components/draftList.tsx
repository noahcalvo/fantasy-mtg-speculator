import { Draft } from '@/app/lib/definitions';
import { fetchDrafts } from '@/app/lib/draft';
import { DraftPill } from './draftPill';

export const DraftList = async ({ leagueId }: { leagueId: number }) => {
  const drafts = await fetchDrafts(leagueId);
  const activeDrafts = drafts.filter((draft: Draft) => draft.active);
  const previousDrafts = drafts.filter((draft: Draft) => !draft.active);
  return (
    <div className="mt-4 p-4">
      <h2 className="mb-4 text-xl text-gray-50 md:text-2xl">Active Drafts</h2>
      <ul className="space-y-2">
        {activeDrafts.map((draft: Draft, key) => (
          <DraftPill key={key} draft={draft} />
        ))}
      </ul>{' '}
      <h2 className="mb-4 mt-4 text-xl text-gray-50 md:text-2xl">
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
