import { Draft } from '@/app/lib/definitions';
import Link from 'next/link';

export const DraftPill = ({ draft }: { draft: Draft }) => {
  const draftClass = draft.active
    ? 'flex cursor-pointer items-center justify-between rounded-full bg-gray-50 px-3 py-2 text-black hover:bg-red-800 hover:text-white focus:outline-red-800 border border-white'
    : 'flex cursor-pointer items-center justify-between rounded-full bg-gray-400 px-3 py-2 text-black hover:bg-red-800 hover:text-white focus:outline-red-800 border border-white';

  return (
    <li key={draft.draft_id}>
      <Link href={`/draft/${draft.draft_id}/view`}>
        <div className={draftClass}>
          <span className="md:text-normal line-clamp-1 text-clip text-xs uppercase">
            {draft.name}
          </span>
          <span className="md:text-normal ml-2 line-clamp-1 text-clip text-xs italic xl:text-xl">
            {draft.set}
          </span>
          <span className="ml-2 rounded-full border-2 px-2">
            {draft.participants.length}
          </span>
        </div>
      </Link>
    </li>
  );
};
