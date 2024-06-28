import { fetchDraft, fetchPicks } from '@/app/lib/draft';
import notFound from '../not-found';
import { fetchMultipleParticipantData, fetchPlayerByEmail } from '@/app/lib/player';
import DraftGrid from '../components/draftGrid';
import AvailableCards from '../components/availableCards';
import { fetchOwnedCards, fetchSet } from '@/app/lib/sets';
import { fetchCardName } from '@/app/lib/card';
import { Card, CardDetails, CardDetailsWithPoints, CardPoint, DraftPick } from '@/app/lib/definitions';
import { auth } from '@/auth';
import { getActivePick } from '@/app/lib/clientActions';
import { fetchLeague } from '@/app/lib/leagues';
import { fetchCardPerformances } from '@/app/lib/performance';

export default async function Page({ params }: { params: { id: string } }) {
  const user = await auth().then((res) => res?.user);
  const player = await fetchPlayerByEmail(user?.email || "")
  const playerId = player.player_id;
  const league = await fetchLeague(playerId)
  const leagueId = league?.league_id ?? 0;


  const draftId = params.id;

  const draft = await fetchDraft(draftId);
  if (!draft) {
    notFound();
  }

  const participantIDs = draft.participants;

  let picks = await fetchPicks(draftId);
  const participants = await fetchMultipleParticipantData(participantIDs);

  const cards = await fetchSet(draft.set);

  console.log("cards:", cards)

  const alreadyOwnedCards = await fetchOwnedCards(draft.set, leagueId);

  const draftedCardNames = await Promise.all(
    picks.map((pick: DraftPick) => pick.card_id ? fetchCardName(pick.card_id) : null)
  );
  
  const undraftedCards = cards.filter(
    (card: CardDetails) => !draftedCardNames.includes(card.name) &&
    !alreadyOwnedCards.some((ownedCard) => ownedCard.name === card.name),
  );

  const undraftedCardIds = undraftedCards.filter((card: CardDetails) => card.card_id !== undefined && card.card_id !== -1).map((card: CardDetails) => card.card_id);

  const undraftedCardPoints = await fetchCardPerformances(undraftedCardIds);

  const undraftedCardsWithPoints: CardDetailsWithPoints[] = undraftedCards.map((card:CardDetails) => {
    const pointsEntry = undraftedCardPoints.find((cp: CardPoint) => cp.card_id === card.card_id);
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
      points,
      week,
    };
  });

  // console.log(undraftedCardsWithPoints)

  const activeDrafter = getActivePick(picks)?.player_id;
  return (
    <main className="flex flex-col content-start justify-center gap-x-2 gap-y-2 py-0 xl:flex-row">
      <div className='overflow-x-auto whitespace-nowrap max-h-[40vh] xl:max-h-[80vh] flex justify-center max-w-full'>
        <DraftGrid picks={picks} participants={participants} />
      </div>
      <div>
      <AvailableCards undraftedCards={undraftedCardsWithPoints} playerId={player.player_id} activeDrafter={activeDrafter == player.player_id} draftId={draft.draft_id} set={draft.set}/>
      </div>
    </main>
  );
}