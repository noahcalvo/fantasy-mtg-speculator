import { fetchDraft, fetchPicks, joinDraft } from '@/app/lib/draft';
import notFound from '../not-found';
import { fetchMultipleParticipantData } from '@/app/lib/player';

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

  return (
<main className="flex justify-center items-center h-screen">
  <table className="table-auto divide-y divide-blue-200">
    <thead>
      <tr>
        {participants.map((participant, index) => (
          <th key={index} className={`h-40 w-40 rounded-md px-4 py-2 text-center text-white border-4 border-white ${index % 2 !== 0 ? 'bg-blue-500' : 'bg-black'}`}>{participant.name}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {Array.from({ length: rounds }, (_, roundIndex) => (
        <tr key={roundIndex} className="space-y-4 border-5">
          {participants.map((participant, participantIndex) => {
            const pick = picks.find(pick => pick.round + 1 === roundIndex + 1 && pick.player_id === participant.player_id);
            return (
              (!pick?.card_id &&
              <td key={participantIndex} className={`h-40 w-40 p-4 rounded-md px-4 py-2 text-center border-4 border-white text-white ${(participantIndex + roundIndex) % 2 === 0 ? 'bg-blue-500' : 'bg-black'}`}>
                {pick ? pick.round+1 + "."+pick.pick_number : ''}
              </td>
               ) || (
                <td key={participantIndex} className={`h-40 w-40 p-4 rounded-md shadow-inner-shadow px-4 py-2 text-center bg-clip-padding border-4 border-white bg-white text-blue-500}`}>
                {pick ? pick.round+1 + "."+pick.pick_number : ''}
                {pick?.card_id}
              </td>
               )
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
</main>  );
}
