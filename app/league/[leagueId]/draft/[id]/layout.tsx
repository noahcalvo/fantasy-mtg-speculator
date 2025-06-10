import Link from 'next/link';
import DraftInfoHeader from './components/draftInfoHeader';
import { fetchDraft } from '@/app/lib/draft';
import notFound from './not-found';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { leagueId: string; id: string };
}) {
  const leagueId = parseInt(params.leagueId);
  const draftId = parseInt(params.id);
  if (isNaN(draftId)) {
    notFound(leagueId);
  }
  const draft = await fetchDraft(draftId);
  if (!draft) {
    return notFound(leagueId);
  }
  return (
    <div className="p-2">
      <main>
        <div className="mb-2 flex w-full flex-wrap items-center gap-2">
          <div>
            <Link
              href={`/league/${leagueId}/draft`}
              className="rounded-md border border-gray-950 bg-gray-50 px-1 py-1 text-xs text-gray-950 transition-colors hover:bg-red-800 hover:text-gray-50"
            >
              All drafts
            </Link>
          </div>
          <div className="inline-flex flex-1 content-center justify-center text-center">
            <DraftInfoHeader draft={draft} />
          </div>
          <div className="w-20"></div>
        </div>
        {children}
      </main>
    </div>
  );
}
