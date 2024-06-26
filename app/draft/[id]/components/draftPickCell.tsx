import { DraftPick, getCardTypesAbbreviation } from '@/app/lib/definitions';
import { fetchParticipantData } from '@/app/lib/player';
import { fetchCard } from '@/app/lib/card';
import Image from 'next/image';

export default async function draftPickCell({ pick, picksTilActive }: { pick: DraftPick, picksTilActive: number }) {
  let cardData = null;
  if (pick.card_id) {
    cardData = await fetchCard(pick.card_id as unknown as number);
  }
  const player = await fetchParticipantData(pick.player_id);

  const cardType = getCardTypesAbbreviation(cardData?.typeLine ?? '').join('/');
  
  return (
    (!pick?.card_id && (
      <td
        className={`overflow-auto text-xs w-24 rounded-md border-2 p-4 px-1 py-2 text-center capitalize border-white
        ${
          picksTilActive == 0 ? 'shadow-inner-shadow bg-clip-padding bg-white text-black' : 
          picksTilActive == 1 ? 'bg-red-900 text-white' : 
          picksTilActive == 2 ? 'bg-orange-900 text-white':
          picksTilActive == 3 ? 'bg-yellow-900 text-white':
          'bg-black text-white'
        }`}
      >
        <div className='w-24 overflow-hidden'>
        <p>{picksTilActive == 0 ? `${player.name} is up!` : `${player.name}`}</p>
        {pick ? pick.round + 1 + '.' + (pick.pick_number + 1) : ''}
        </div>
      </td>
    )) || (
      <td
        className="overflow-auto text-xs w-24 shadow-inner-shadow text-black h-40 rounded-md border-4 border-white bg-white bg-clip-padding px-1 py-2 text-center"
      >
        {pick ? pick.round + 1 + '.' + (pick.pick_number + 1) : ''}
        <div className='font-bold w-24 overflow-auto no-scrollbar'>{cardData?.name}</div>
        <div className='w-24 text-wrap'>{cardType}</div>
        {cardData?.image && (
          <Image
            src={cardData?.image ?? ''}
            alt={cardData?.name ?? ''}
            width={200}
            height={100}
            className='w-full'
          />
        )}
      </td>
    )
  );
}
