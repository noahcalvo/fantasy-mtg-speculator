import { Draft } from '@/app/lib/definitions';
import { fetchDrafts } from '@/app/lib/draft';
import Link from 'next/link';

export const DraftList = async () => {
    const drafts = await fetchDrafts();
    return (
        <div className='mt-4'>
            <h2 className="mb-4 text-xl md:text-2xl">Active Drafts</h2>
            <ul>
                {drafts.map((draft: Draft, key) => (
                    draft.active && 
                    <li key={key}>
                        <Link className="text-blue-500 hover:text-blue-800 focus:outline-none" href={`/draft/${draft.draft_id}/view`}>
                            {draft.set}
                        </Link>
                    </li>
                ))}
            </ul>
            <h2 className="mb-4 text-xl md:text-2xl mt-4">Previous Drafts</h2>
            <ul>
                {drafts.map((draft: Draft, key) => (
                    !draft.active && 
                    <li key={key}>
                        <Link className="text-blue-500 hover:text-blue-800 focus:outline-none" href={`/draft/${draft.draft_id}/view`}>
                            {draft.set}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};
