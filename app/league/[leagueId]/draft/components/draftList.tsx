import { Draft } from '@/app/lib/definitions';
import { fetchDrafts } from '@/app/lib/draft';
import { DraftPill } from './draftPill';

export const DraftList = async ({ leagueId }: { leagueId: number }) => {
  const drafts = await fetchDrafts(leagueId);
  const activeDrafts = drafts.filter((draft: Draft) => draft.active);
  const previousDrafts = drafts.filter((draft: Draft) => !draft.active);
  return (
    <div className="mt-8 rounded-xl bg-gray-950 p-4">
      <h2 className="mb-4 text-sm text-gray-50">Active Drafts</h2>
      <ul className="space-y-2 text-gray-50">
        {activeDrafts.map((draft: Draft, key) => (
          <DraftPill key={key} draft={draft} leagueId={leagueId} />
        ))}
        {activeDrafts.length == 0 && (
          <p className="text-md pl-2 lg:text-lg">No active drafts.</p>
        )}
      </ul>{' '}
      <h2 className="mb-4 mt-4 text-sm text-gray-50">Completed Drafts</h2>
      <ul className="space-y-2 text-gray-50">
        {previousDrafts.map((draft: Draft, key) => (
          <DraftPill key={key} draft={draft} leagueId={leagueId} />
        ))}
        {previousDrafts.length == 0 && (
          <p className="lg:text-md pl-2 text-sm">
            Your league hasn&apos;t completed any drafts.
          </p>
        )}
      </ul>
    </div>
  );
};
