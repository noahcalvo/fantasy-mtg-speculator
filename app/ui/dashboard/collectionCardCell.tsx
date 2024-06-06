'use client';
import { CardDetails, getAbbreviation, getRosterPositions } from '@/app/lib/definitions';
import { playPositionSlot } from '@/app/lib/rosters';
import Image from 'next/image';

export default function CollectionCardCell({
  card,
  email,
}: {
  card: CardDetails | null;
  email: string;
}) {
  const positions = getRosterPositions();
  let cardType = positions.find((position) => {
    if (position.includes('/')) {
      const splitPositions = position.split('/');
      return splitPositions.some(
        (splitPosition) => card?.typeLine.includes(splitPosition),
      );
    } else {
      return card?.typeLine.includes(position);
    }
  });
  cardType = cardType || '';
  return (
    // add cardType to the card item

    <div className="m-2 flex justify-between border border-gray-300 p-2">
      {card ? (
        <div className="flex w-full justify-between">
          <Image src={card.image} alt={card.name} className="w-1/4 h-auto" width={100} height={100} />
          <div className="flex flex-col items-end justify-around">
            <div className="font-bold">{card.name}</div>
            <div >{cardType}</div>
            <div className='flex'>
              {cardType && (
                <button
                  className={`w-15 mx-2 rounded-md border border-black bg-white 
                  p-2 text-black hover:bg-red-800 hover:text-white text-sm`}
                  //   ${
                  //     activeDrafter ? 'bg-white hover:bg-red-800 hover:text-white' : 'bg-gray-500 text-white'
                  //   }
                  disabled={false}
                  onClick={() => playPositionSlot(card.card_id, email, cardType ?? "")}
                >
                  Play in {getAbbreviation(cardType)}
                </button>
              )}
              <button
                className={`w-15 mx-2 rounded-md border border-black bg-white 
                  p-2 text-black hover:bg-red-800 hover:text-white text-sm`}
                //   ${
                //     activeDrafter ? 'bg-white hover:bg-red-800 hover:text-white' : 'bg-gray-500 text-white'
                //   }
                disabled={false}
                onClick={() => playPositionSlot(card.card_id, email, "flex")}
              >
                Play in Flex
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div>Empty</div>
      )}
    </div>
  );
}
