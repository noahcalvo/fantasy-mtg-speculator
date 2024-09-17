import Link from 'next/link';
import DraftInfoHeader from './components/draftInfoHeader';
import { fetchDraft } from '@/app/lib/draft';
import notFound from './not-found';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const draftIdString = params.id;
  // convert draftId to number
  const draftId = parseInt(draftIdString, 10);
  if (isNaN(draftId)) {
    notFound();
  }
  const draft = await fetchDraft(draftId);
  if (!draft) {
    return notFound();
  }
  return (
    <div>
      <main>
        <div className="flex w-full items-center p-2">
          <div className="w-20">
            <Link
              href="/draft"
              className="rounded-md border border-white bg-white px-1 py-1 text-sm text-black transition-colors hover:bg-red-800 hover:text-white"
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
