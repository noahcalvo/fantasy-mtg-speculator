import { DraftPick } from '@/app/lib/definitions';
import { fetchParticipantData } from '@/app/lib/player';
import { fetchCard } from '@/app/lib/sets';
import Image from 'next/image';

export default async function draftPickCell({ pick, picksTilActive }: { pick: DraftPick, picksTilActive: number }) {
  let cardData = null;
  if (pick.card_id) {
    cardData = await fetchCard(pick.card_id as unknown as number);
  }
  const player = await fetchParticipantData(pick.player_id);
  
  return (
    (!pick?.card_id && (
      <td
        className={`overflow-hidden text-xs w-32 rounded-md border-2 p-4 px-1 py-2 text-center capitalize border-white
        ${
          picksTilActive == 0 ? 'shadow-inner-shadow bg-clip-padding bg-white text-black' : 
          picksTilActive == 1 ? 'bg-red-900 text-white' : 
          picksTilActive == 2 ? 'bg-orange-900 text-white':
          picksTilActive == 3 ? 'bg-yellow-900 text-white':
          'bg-black text-white'
        }`}
      >
        <div className='w-28'>
        <p>{picksTilActive == 0 ? `${player.name} is up!` : `${player.name}`}</p>
        {pick ? pick.round + 1 + '.' + (pick.pick_number + 1) : ''}
        </div>
      </td>
    )) || (
      <td
        className="overflow-hidden text-xs w-32 shadow-inner-shadow text-black h-40 rounded-md border-4 border-white bg-white bg-clip-padding px-1 py-2 text-center"
      >
        {pick ? pick.round + 1 + '.' + (pick.pick_number + 1) : ''}
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
