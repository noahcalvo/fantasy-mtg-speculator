import { Draft } from "@/app/lib/definitions"
import Link from "next/link"

export const DraftPill = ({ key, draft}: { key: number, draft: Draft }) => {
    const draftClass = draft.active ? 
    "flex cursor-pointer items-center justify-between rounded-full bg-white px-3 py-2 text-black hover:bg-red-800 hover:text-white focus:outline-red-800 border border-white" : 
    "flex cursor-pointer items-center justify-between rounded-full bg-gray-400 px-3 py-2 text-black hover:bg-red-800 hover:text-white focus:outline-red-800 border border-white";

    return (
        <li
        key={key}
      >
        <Link href={`/draft/${draft.draft_id}/view`}>
            <div className={draftClass}>
              <span className="uppercase">{draft.name}</span>
              <span className="ml-2 italic text-xl">{draft.set}</span>
              <span className="ml-2 rounded-full px-2 border-2">
                {draft.participants.length}
              </span>
            </div>
        </Link>
      </li>
    )
}