import { fetchDraft } from '@/app/lib/draft';
import notFound from './not-found';
import FullscreenFrame from './components/fullscreenFrame';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { leagueId: string; id: string };
}) {
  const leagueId = Number(params.leagueId);
  const draftId = Number(params.id);
  if (Number.isNaN(draftId)) notFound(leagueId);

  const draft = await fetchDraft(draftId);
  if (!draft) return notFound(leagueId);

  return (
    <FullscreenFrame
      leagueId={leagueId}
      draftId={draftId}
      draftName={draft.name}
    >
      {children}
    </FullscreenFrame>
  );
}
