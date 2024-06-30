import { fetchDraft, redirectIfJoined } from '@/app/lib/draft';
import { auth } from '@/auth';
import JoinDraft from '../components/joinDraft';
import notFound from '../not-found';
import { fetchPlayerByEmail } from '@/app/lib/player';

export default async function Page({ params }: { params: { id: string } }) {
  const draftId = params.id;

  const draft = await fetchDraft(draftId);
  if (!draft) {
    notFound();
  }

  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  await redirectIfJoined(draft.participants, playerId, draft.draft_id);

  if (!draft.active) {
    return <div>Draft completed</div>;
  }

  return (
      <JoinDraft
        playerId={playerId}
        draftId={draftId}
        participants={draft.participants}
      />
  );
}
