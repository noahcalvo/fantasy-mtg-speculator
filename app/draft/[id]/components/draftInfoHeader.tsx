import { Draft } from '@/app/lib/definitions';

export default function DraftInfoHeader({ draft }: { draft: Draft }) {
  return (
    <div className="inline-flex rounded-lg border border-white px-1 text-white shadow-inner-shadow">
      <h1 className="line-clamp-2 text-2xl md:text-3xl">{draft.name}</h1>
    </div>
  );
}
