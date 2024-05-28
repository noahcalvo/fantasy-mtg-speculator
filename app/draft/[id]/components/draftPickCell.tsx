import { DraftPick } from '@/app/lib/definitions';
import { fetchCard } from '@/app/lib/sets';
import Image from 'next/image';

export default async function draftPickCell({ pick }: { pick: DraftPick }) {
  let cardData = null;
  if (pick.card_id) {
    cardData = await fetchCard(pick.card_id as unknown as number);
  }
  return (
    (!pick?.card_id && (
      <td
        className={`h-40 w-40 rounded-md border-4 border-white p-4 px-4 py-2 text-center text-white ${
          (pick.pick_number + pick.round) % 2 === 0 ? 'bg-blue-500' : 'bg-black'
        }`}
      >
        {pick ? pick.round + 1 + '.' + pick.pick_number : ''}
      </td>
    )) || (
      <td
        className={`shadow-inner-shadow text-blue-500} h-40 w-40 rounded-md border-4 border-white bg-white bg-clip-padding p-4 px-4 py-2 text-center`}
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
