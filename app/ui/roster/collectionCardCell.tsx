'use client';
import {
  CardDetails,
  getAbbreviation,
  getCardTypes,
  getCardTypesList,
} from '@/app/lib/definitions';
import { playPositionSlot } from '@/app/lib/rosters';
import { routeToCardPageById } from '@/app/lib/routing';
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
  let cardTypes = getCardTypesList(card?.typeLine ?? '');
  let cardTypeName = getCardTypes(card?.typeLine ?? '');
  return (
    // add cardType to the card item

    <div className="mt-[- m-2 flex justify-between border border-gray-300 p-2">
      {card ? (
        <div className="flex w-full justify-between">
          <Image
            src={card.image[0]}
            alt={card.name}
            className="h-auto w-1/4 cursor-pointer"
            width={100}
            height={100}
            onClick={() => routeToCardPageById(card.card_id)}
          />
          <div className="flex flex-col items-end justify-around">
            <div
              className="cursor-pointer font-bold underline"
              onClick={() => routeToCardPageById(card.card_id)}
            >
              {card.name}
            </div>
            <div>{cardTypeName}</div>
            <div className="flex">
              {cardTypeName &&
                cardTypes.map((cardType) => (
                  <button
                    key={cardType}
                    className={`w-15 mx-2 rounded-md border border-black bg-gray-50 
    p-2 text-sm text-gray-950 hover:bg-red-800 hover:text-gray-50`}
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
                className={`w-15 mx-2 rounded-md border border-black bg-gray-50 
                  p-2 text-sm text-gray-950 hover:bg-red-800 hover:text-gray-50`}
                //   ${
                //     activeDrafter ? 'bg-gray-50 hover:bg-red-800 hover:text-gray-50' : 'bg-gray-500 text-gray-50'
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
