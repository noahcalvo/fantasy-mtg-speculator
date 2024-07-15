'use client';
import {
  CardDetails,
  getAbbreviation,
  getCardTypes,
  getCardTypesList,
  getRosterPositions,
} from '@/app/lib/definitions';
import { playPositionSlot } from '@/app/lib/rosters';
import Image from 'next/image';

export default function CollectionCardCell({
  card,
  playerId,
  leagueId,
}: {
  card: CardDetails | null;
  playerId: number;
  leagueId: number;
}) {
  const positions = getRosterPositions();
  let cardTypes = getCardTypesList(card?.typeLine ?? '');
  let cardTypeName = getCardTypes(card?.typeLine ?? '');
  return (
    // add cardType to the card item

    <div className="m-2 flex justify-between border border-gray-300 p-2">
      {card ? (
        <div className="flex w-full justify-between">
          <Image
            src={card.image[0]}
            alt={card.name}
            className="h-auto w-1/4"
            width={100}
            height={100}
          />
          <div className="flex flex-col items-end justify-around">
            <div className="font-bold">{card.name}</div>
            <div>{cardTypeName}</div>
            <div className="flex">
              {cardTypeName &&
                cardTypes.map((cardType) => (
                  <button
                    key={cardType}
                    className={`w-15 mx-2 rounded-md border border-black bg-white 
    p-2 text-sm text-black hover:bg-red-800 hover:text-white`}
                    disabled={false}
                    onClick={() =>
                      playPositionSlot(
                        card.card_id,
                        playerId,
                        cardType,
                        leagueId,
                      )
                    }
                  >
                    Play in {getAbbreviation(cardType)}
                  </button>
                ))}
              <button
                className={`w-15 mx-2 rounded-md border border-black bg-white 
                  p-2 text-sm text-black hover:bg-red-800 hover:text-white`}
                //   ${
                //     activeDrafter ? 'bg-white hover:bg-red-800 hover:text-white' : 'bg-gray-500 text-white'
                //   }
                disabled={false}
                onClick={() =>
                  playPositionSlot(card.card_id, playerId, 'flex', leagueId)
                }
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
