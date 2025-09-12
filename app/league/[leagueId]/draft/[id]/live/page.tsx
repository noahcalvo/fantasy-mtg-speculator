import { fetchDraft, fetchPicks, fetchUndraftedCards } from '@/app/lib/draft';
import notFound from '../not-found';
import { fetchPlayerByEmail } from '@/app/lib/player';
import DraftGrid from '../components/draftGrid';
import AvailableCards from '../components/availableCards';
import {
  CardDetails,
  CardDetailsWithPoints,
  CardPoint,
} from '@/app/lib/definitions';
import { auth } from '@/auth';
import { getActivePick } from '@/app/lib/clientActions';
import { fetchCardPerformances } from '@/app/lib/performance';
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

  const undraftedCards = await fetchUndraftedCards(draftId);
  const undraftedCardIds = undraftedCards
    .filter(
      (card: CardDetails) => card.card_id !== undefined && card.card_id !== -1,
    )
    .map((card: CardDetails) => card.card_id);

  const undraftedCardPoints = await fetchCardPerformances(
    undraftedCardIds,
    leagueId,
  );

  const undraftedCardsWithPoints: CardDetailsWithPoints[] = undraftedCards.map(
    (card: CardDetails) => {
      const pointsEntry = undraftedCardPoints.find(
        (cp: CardPoint) => cp.card_id === card.card_id,
      );
      const points = pointsEntry?.total_points || 0;
      const week = pointsEntry?.week || -1;
      return {
        card_id: card.card_id,
        name: card.name,
        typeLine: card.typeLine,
        image: card.image,
        price: card.price,
        scryfallUri: card.scryfallUri,
        colorIdentity: card.colorIdentity,
        set: card.set,
        points,
        week,
      };
    },
  );

  const activeDrafter = getActivePick(picks)?.player_id;
  const isLeagueCommissioner = await isCommissioner(
    player?.player_id,
    leagueId,
  );

  return (
    <main className="flex flex-col content-start justify-center gap-2 py-0">
      {isLeagueCommissioner && (
        <PauseResumeDraft
          draftId={draftId}
          leagueId={leagueId}
          commissioner={isLeagueCommissioner}
        />
      )}
      <div className="flex flex-col justify-center gap-2 xl:flex-row">
        <div className="flex max-h-[40vh] max-w-full justify-center overflow-x-auto whitespace-nowrap xl:max-h-[80vh]">
          <DraftGrid draftId={draftId} />
        </div>
        <div>
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
      </div>
    </main>
  );
}
