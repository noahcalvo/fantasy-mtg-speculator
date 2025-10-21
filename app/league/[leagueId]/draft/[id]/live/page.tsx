import {
  fetchDraft,
  fetchPicks,
  fetchUndraftedWithPoints,
} from '@/app/lib/draft';
import notFound from '../not-found';
import { fetchPlayerByEmail } from '@/app/lib/player';
import DraftGrid from '../components/draftGrid';
import AvailableCards from '../components/availableCards';
import { auth } from '@/auth';
import { getActivePick } from '@/app/lib/clientActions';
import PauseResumeDraft from '../components/pauseResumeDraft';
import { isCommissioner } from '@/app/lib/leagues';

export default async function Page({
  params,
}: {
  params: { leagueId: string; id: string };
}) {
  const leagueId = parseInt(params.leagueId);
  const user = await auth().then((res) => res?.user);
  const player = await fetchPlayerByEmail(user?.email || '');

  const draftIdString = params.id;
  // convert draftId to number
  const draftId = parseInt(draftIdString, 10);
  if (isNaN(draftId)) {
    notFound(leagueId);
  }

  const draft = await fetchDraft(draftId);
  if (!draft) {
    notFound(leagueId);
  }

  const picks = await fetchPicks(draftId);

  const undraftedCardsWithPoints = await fetchUndraftedWithPoints(
    draftId,
    leagueId,
  );

  const activeDrafter = getActivePick(picks)?.player_id;
  const isLeagueCommissioner = await isCommissioner(
    player?.player_id,
    leagueId,
  );

  console.log(isLeagueCommissioner, draft);

  return (
    <main className="flex flex-col content-start justify-center gap-2 py-0">
      {isLeagueCommissioner &&
        draft.current_pick_deadline_at &&
        draft.active && (
          <PauseResumeDraft
            draftId={draftId}
            leagueId={leagueId}
            commissioner={isLeagueCommissioner}
          />
        )}
      <div className="grid grid-cols-1 items-start justify-around justify-items-center gap-2 md:grid-cols-2">
        <DraftGrid draftId={draftId} />
        <AvailableCards
          undraftedCards={undraftedCardsWithPoints}
          playerId={player.player_id}
          activeDrafter={activeDrafter == player.player_id}
          draftId={draft.draft_id}
          set={draft.set}
          leagueId={leagueId}
          isPaused={draft.paused_at !== null}
        />
      </div>
    </main>
  );
}
