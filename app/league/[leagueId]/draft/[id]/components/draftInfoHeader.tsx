import { Draft } from '@/app/lib/definitions';

export default function DraftInfoHeader({ draft }: { draft: Draft }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-950 px-1 text-gray-950 shadow-inner-shadow">
      <p className="line-clamp-1 text-2xl md:text-3xl" title={draft.name}>
        {draft.name}
      </p>
    </div>
  );
}
