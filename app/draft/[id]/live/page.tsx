import { fetchDraft, fetchPicks, joinDraft } from '@/app/lib/draft';
import notFound from '../not-found';
import { fetchMultipleParticipantData } from '@/app/lib/player';
import DraftGrid from '../components/draftGrid';
import AvailableCards from '../components/availableCards';
import { fetchSet } from '@/app/lib/sets';
import { CardDetails } from '@/app/lib/definitions';

export default async function Page({ params }: { params: { id: string } }) {
  const draftId = params.id;

  const draft = await fetchDraft(draftId);
  if (!draft) {
    notFound();
  }

  const participantIDs = draft.participants;
  const rounds = draft.rounds;

  let picks = await fetchPicks(draftId);
  picks[0].card_id = "1";
  const participants = await fetchMultipleParticipantData(participantIDs);

  const cards = await fetchSet(draft.set);

  const undraftedCards = cards.filter(
    (card: CardDetails) => !picks.some((pick) => pick.card_id === card.name),
  );


  return (
<main className="flex justify-center content-start items-start p-8">
  <DraftGrid picks={picks} participants={participants} />
  <AvailableCards undraftedCards={undraftedCards}/>
</main>  );
}
