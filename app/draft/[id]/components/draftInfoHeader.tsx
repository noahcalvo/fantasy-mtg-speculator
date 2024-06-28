import { Draft } from '@/app/lib/definitions';

export default function DraftInfoHeader({ draft }: { draft: Draft }) {
  return (
    <div className="rounded-lg border border-white text-white shadow-inner-shadow px-1">
      <h1 className="text-2xl md:text-3xl line-clamp-2">
        {draft.name}
      </h1>
    </div>
  );
};