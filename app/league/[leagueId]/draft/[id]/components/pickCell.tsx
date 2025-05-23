'use client';
import { CardDetails, DraftPick } from '@/app/lib/definitions';
import { routeToCardPageById } from '@/app/lib/routing';
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
        className={`w-24 overflow-auto border-2 border-gray-950 p-4 px-1 py-2 text-center text-xs capitalize
    ${
      picksTilActive == 0
        ? 'bg-gray-50 bg-clip-padding text-gray-950 shadow-inner-shadow'
        : picksTilActive == 1
          ? 'bg-red-900 text-gray-50'
          : picksTilActive == 2
            ? 'bg-orange-900 text-gray-50'
            : picksTilActive == 3
              ? 'bg-yellow-900 text-gray-50'
              : 'bg-gray-950 text-gray-50'
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
        className="h-40 w-24 cursor-pointer overflow-auto border-4 border-gray-950 bg-gray-50 bg-clip-padding px-1 py-2 text-center text-xs text-gray-950 shadow-inner-shadow hover:underline"
        onClick={() => routeToCardPageById(cardData?.card_id ?? -1)}
      >
        <div className="inline-block hover:no-underline">
          {pick ? pick.round + 1 + '.' + (pick.pick_number + 1) : ''}
        </div>
        <div className="no-scrollbar w-24 overflow-auto font-bold">
          {cardData?.name}
        </div>
        <div className="text-wrap w-24">{cardType}</div>
        {cardData?.image && (
          <Image
            src={cardData?.image[0] ?? ''}
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
