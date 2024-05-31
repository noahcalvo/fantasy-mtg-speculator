import { DraftPick } from '@/app/lib/definitions';
import { fetchParticipantData } from '@/app/lib/player';
import { fetchCard } from '@/app/lib/sets';
import { get } from 'http';
import Image from 'next/image';

export default async function draftPickCell({ pick, active }: { pick: DraftPick, active: boolean }) {
  let cardData = null;
  if (pick.card_id) {
    cardData = await fetchCard(pick.card_id as unknown as number);
  }
  const player = await fetchParticipantData(pick.player_id);
  
  return (
    (!pick?.card_id && (
      <td
        className={`overflow-hidden text-xs w-32 rounded-md border-2 p-4 px-1 py-2 text-center  border-white
        ${
          active ? 'shadow-inner-shadow bg-clip-padding bg-white text-black' : (pick.pick_number + pick.round) % 2 === 0 ? 'bg-red-900 text-white' : 'bg-black text-white'
        }`}
      >
        <div className='w-28'>
        <p>{active ? `${player.name} is up!` : `${player.name}`}</p>
        {pick ? pick.round + 1 + '.' + pick.pick_number : ''}
        </div>
      </td>
    )) || (
      <td
        className="overflow-hidden text-xs w-32 shadow-inner-shadow text-black h-40 rounded-md border-4 border-white bg-white bg-clip-padding px-1 py-2 text-center"
      >
        {pick ? pick.round + 1 + '.' + pick.pick_number : ''}
        <div className='font-bold w-28'>{cardData?.name}</div>
        {cardData?.image && (
          <Image
            src={cardData?.image ?? ''}
            alt={cardData?.name ?? ''}
            width={200}
            height={200}
            className='w-full'
          />
        )}
      </td>
    )
  );
}
