import { fetchDraft, fetchPicks } from '@/app/lib/draft';
import notFound from '../not-found';
import { fetchMultipleParticipantData, fetchPlayerByEmail } from '@/app/lib/player';
import DraftGrid from '../components/draftGrid';
import AvailableCards from '../components/availableCards';
import { fetchCardName, fetchOwnedCards, fetchSet } from '@/app/lib/sets';
import { CardDetails, DraftPick } from '@/app/lib/definitions';
import { auth } from '@/auth';
import { getActivePick } from '@/app/lib/clientActions';
import { fetchLeague } from '@/app/lib/leagues';

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

  const alreadyOwnedCards = await fetchOwnedCards(draft.set, leagueId);

  const draftedCardNames = await Promise.all(
    picks.map((pick: DraftPick) => pick.card_id ? fetchCardName(pick.card_id) : null)
  );
  
  const undraftedCards = cards.filter(
    (card: CardDetails) => !draftedCardNames.includes(card.name) &&
    !alreadyOwnedCards.some((ownedCard) => ownedCard.name === card.name),
  );

  const activeDrafter = getActivePick(picks)?.player_id;
  return (
    <main className="flex flex-col content-start justify-center gap-x-2 gap-y-2 py-2 xl:flex-row">
      <div className='overflow-x-auto max-w-full whitespace-nowrap'>
        <DraftGrid picks={picks} participants={participants} />
      </div>
      <AvailableCards undraftedCards={undraftedCards} playerId={player.player_id} activeDrafter={activeDrafter == player.player_id} draftId={draft.draft_id} set={draft.set}/>
    </main>
  );
}