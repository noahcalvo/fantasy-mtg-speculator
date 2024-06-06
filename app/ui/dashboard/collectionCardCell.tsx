'use client';
import { CardDetails, getRosterPositions } from '@/app/lib/definitions';
import Image from 'next/image';

interface CardDetailsWithType extends CardDetails {
    cardType: string;
}

export default function CollectionCardCell({
  card,
}: {
  card: CardDetails | null;
}) {
    const positions = getRosterPositions();
    let cardType = positions.find((position) => {
        if(position.includes('/')) {
            const splitPositions = position.split('/');
            return splitPositions.some((splitPosition) => card?.typeLine.includes(splitPosition));
        } else {
            console.log(card?.name, card?.typeLine.includes(position))
            return card?.typeLine.includes(position);
        }
    });
    cardType = cardType || 'Flex';
    return (
    // add cardType to the card item

    <div className='border border-gray-300 m-2 flex p-2 justify-between'>
      {card ? (
        <div className='flex justify-between w-full'>
        <Image src={card.image} alt={card.name} width={100} height={100} />
        <div className='flex flex-col items-end justify-around'>
          <div>{card.name}</div>
          <div className='font-bold'>{cardType}</div>
          <div>
          <button
                  className={`mx-2 rounded-md p-2 text-black border border-black 
                  bg-white hover:bg-red-800 hover:text-white w-15`}
                //   ${
                //     activeDrafter ? 'bg-white hover:bg-red-800 hover:text-white' : 'bg-gray-500 text-white'
                //   }
                  disabled={false}
                  onClick={() => alert("not implemented")}
                >
                  Play
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
