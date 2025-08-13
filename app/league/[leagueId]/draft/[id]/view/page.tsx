import { fetchDraft, redirectIfJoined } from '@/app/lib/draft';
import { auth } from '@/auth';
import JoinDraft from '../components/joinDraft';
import notFound from '../not-found';
import { fetchPlayerByEmail } from '@/app/lib/player';

export default async function Page({
  params,
}: {
  params: { id: string; leagueId: string };
}) {
  const draftId = parseInt(params.id);
  const leagueId = parseInt(params.leagueId);
  // convert draftId to number
  if (isNaN(draftId)) {
    notFound(leagueId);
  }

  const draft = await fetchDraft(draftId);
  if (!draft) {
    notFound(leagueId);
  }

  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  console.log('participants:', draft.participants);
  await redirectIfJoined(
    draft.participants,
    playerId,
    draft.draft_id,
    leagueId,
  );

  if (!draft.active) {
    return <div>Draft completed</div>;
  }

  return (
    <JoinDraft
      playerId={playerId}
      draftId={draftId}
      participants={draft.participants}
      leagueId={leagueId}
    />
  );
}
