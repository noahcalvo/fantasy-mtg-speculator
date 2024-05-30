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
        className={`h-40 w-40 rounded-md border-4 p-4 px-4 py-2 text-center  border-white ${
          (pick.pick_number + pick.round) % 2 === 0 ? 'bg-blue-500' : 'bg-black'
        }
        ${
          active ? 'shadow-inner-shadow bg-clip-padding bg-white text-blue-500 animate-spin' : 'text-white'
        }`}
      >
        <div className={`${active ? 'animate-spin' : ''}`}>
        <p className="text-2xl">{active ? `${player.name} is on the board` : `${player.name}`}</p>
        {pick ? pick.round + 1 + '.' + pick.pick_number : ''}
        </div>
      </td>
    )) || (
      <td
        className="shadow-inner-shadow text-blue-500 h-40 w-40 rounded-md border-4 border-white bg-white bg-clip-padding p-4 px-4 py-2 text-center"
      >
        {pick ? pick.round + 1 + '.' + pick.pick_number : ''}
        <div className='text-blue-500 font-bold text-xl'>{cardData?.name}</div>
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
