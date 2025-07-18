import { Draft } from '@/app/lib/definitions';
import Link from 'next/link';

export const DraftPill = ({
  draft,
  leagueId,
}: {
  draft: Draft;
  leagueId: number;
}) => {
  const draftClass = draft.active
    ? 'grid grid-cols-12 cursor-pointer items-center justify-between rounded-full bg-gray-50 px-3 py-2 text-gray-950 hover:bg-red-800 hover:text-gray-50 focus:outline-red-800 border border-red-800'
    : 'grid grid-cols-12 cursor-pointer items-center justify-between rounded-full bg-gray-50 px-3 py-2 text-gray-950 hover:bg-red-800 hover:text-gray-50 focus:outline-red-800 border border-gray-950';

  return (
    <li key={draft.draft_id} className="mb-4 md:mb-0">
      <p className="w-full text-center text-xs uppercase text-gray-50 md:hidden">
        {draft.set}
      </p>
      <Link href={`/league/${leagueId}/draft/${draft.draft_id}/view`}>
        <div className={draftClass}>
          <span className="md:text-normal col-span-10 line-clamp-1 text-clip text-xs uppercase md:col-span-6">
            {draft.name}
          </span>
          <span className="md:text-normal col-span-5 ml-2 line-clamp-1 hidden text-clip text-xs italic md:inline-block">
            {draft.set}
          </span>
          <span className="right-2 col-span-2 ml-2 inline-flex justify-center rounded-full border-2 px-2 md:col-span-1">
            {draft.participants.length}
          </span>
        </div>
      </Link>
    </li>
  );
};
