import { Draft } from '@/app/lib/definitions';
import { fetchDrafts } from '@/app/lib/draft';
import Link from 'next/link';

export const DraftList = async () => {
  const drafts = await fetchDrafts();
  const activeDrafts = drafts.filter((draft: Draft) => draft.active);
    const previousDrafts = drafts.filter((draft: Draft) => !draft.active);
  return (
    <div className="mt-4 p-4">
      <h2 className="text-xl md:text-2xl mb-4 text-white">Active Drafts</h2>
      <ul className="space-y-2">
        {activeDrafts.map((draft: Draft, key) => (
          <li
            key={key}
          >
            <Link href={`/draft/${draft.draft_id}/view`}>
                <div className='justify-between flex cursor-pointer items-center rounded-full bg-white px-3 py-2 text-black hover:bg-red-800 hover:text-white focus:outline-red-800 border border-white'>
                  <span className="uppercase">{draft.name}</span>
                  <span className="ml-2 italic text-xl">{draft.set}</span>
                  <span className="ml-2 rounded-full px-2 border-2">
                    {draft.participants.length}
                  </span>
                </div>
            </Link>
          </li>
        ))}
      </ul>{' '}
      <h2 className="text-xl md:text-2xl mb-4 mt-4 text-white">Previous Drafts</h2>
      <ul className="space-y-2">
      {previousDrafts.map((draft: Draft, key) => (
          <li
            key={key}
            className="flex cursor-pointer items-center justify-between rounded-full bg-blue-500 px-3 py-2 text-white hover:bg-blue-200 hover:text-blue-800 focus:outline-none"
          >
            <Link href={`/draft/${draft.draft_id}/view`}>
                <>
                  <span className="uppercase">{draft.name}</span>
                  <span className="ml-2 rounded-full px-2 border-2">
                    {draft.participants.length}
                  </span>
                  <span className="ml-2 italic text-xl">{draft.set}</span>
                </>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
