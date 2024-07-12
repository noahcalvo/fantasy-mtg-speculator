'use client';
import { CardDetails, DraftPick } from '@/app/lib/definitions';
import { routeToCardPage } from '@/app/lib/routing';
import Image from 'next/image';

export default function PickCell({
  picksTilActive,
  cardData,
  playerName,
  pick,
  cardType,
}: {
  picksTilActive: number;
  cardData: CardDetails | null;
  playerName: string;
  pick: DraftPick;
  cardType: string;
}) {
  return (
    (!pick?.card_id && (
      <td
        className={`w-24 overflow-auto rounded-md border-2 border-white p-4 px-1 py-2 text-center text-xs capitalize
    ${
      picksTilActive == 0
        ? 'bg-white bg-clip-padding text-black shadow-inner-shadow'
        : picksTilActive == 1
          ? 'bg-red-900 text-white'
          : picksTilActive == 2
            ? 'bg-orange-900 text-white'
            : picksTilActive == 3
              ? 'bg-yellow-900 text-white'
              : 'bg-black text-white'
    }`}
      >
        <div className="w-24 overflow-hidden">
          <p>
            {picksTilActive == 0 ? `${playerName} is up!` : `${playerName}`}
          </p>
          {pick ? pick.round + 1 + '.' + (pick.pick_number + 1) : ''}
        </div>
      </td>
    )) || (
      <td
        className="h-40 w-24 overflow-auto rounded-md border-4 border-white bg-white bg-clip-padding px-1 py-2 text-center text-xs text-black shadow-inner-shadow hover:scale-95"
        onClick={() => routeToCardPage(cardData?.card_id ?? -1)}
      >
        {pick ? pick.round + 1 + '.' + (pick.pick_number + 1) : ''}
        <div className="no-scrollbar w-24 overflow-auto font-bold">
          {cardData?.name}
        </div>
        <div className="text-wrap w-24">{cardType}</div>
        {cardData?.image && (
          <Image
            src={cardData?.image ?? ''}
            alt={cardData?.name ?? ''}
            width={200}
            height={100}
            className="w-full"
          />
        )}
      </td>
    )
  );
}
