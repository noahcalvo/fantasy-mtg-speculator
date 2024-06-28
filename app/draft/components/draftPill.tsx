import { Draft } from "@/app/lib/definitions"
import Link from "next/link"

export const DraftPill = ({ draft}: { draft: Draft }) => {
    const draftClass = draft.active ? 
    "flex cursor-pointer items-center justify-between rounded-full bg-white px-3 py-2 text-black hover:bg-red-800 hover:text-white focus:outline-red-800 border border-white" : 
    "flex cursor-pointer items-center justify-between rounded-full bg-gray-400 px-3 py-2 text-black hover:bg-red-800 hover:text-white focus:outline-red-800 border border-white";

    return (
        <li
        key={draft.draft_id}
      >
        <Link href={`/draft/${draft.draft_id}/view`}>
            <div className={draftClass}>
              <span className="uppercase line-clamp-1 text-clip text-xs md:text-normal">{draft.name}</span>
              <span className="ml-2 italic xl:text-xl line-clamp-1 text-clip text-xs md:text-normal">{draft.set}</span>
              <span className="ml-2 rounded-full px-2 border-2">
                {draft.participants.length}
              </span>
            </div>
        </Link>
      </li>
    )
}