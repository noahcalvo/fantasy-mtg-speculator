'use client';
import { CardDetails, CardPerformances } from '@/app/lib/definitions';
import { routeToCardPageById } from '@/app/lib/routing';
import Image from 'next/image';
import { useState } from 'react';

export default function Collection({
  collection,
  mostRecentPoints,
  secondMostRecentPoints,
}: {
  playerId: number;
  leagueId: number;
  collection: CardDetails[];
  mostRecentPoints: CardPerformances;
  secondMostRecentPoints: CardPerformances;
}) {
  const [selectedCard, setSelectedCard] = useState<CardDetails | null>(
    collection[0],
  );

  return (
    <>
      <h2 className="m-2 pl-5 text-xl">Full Collection</h2>
      <div className="grid grid-cols-2">
        <div className="mt-32 rounded-md bg-white">
          <div className="flex flex-col items-center">
            {collection.map((card) => (
              <div
                className="relative -mt-32 cursor-pointer transition hover:rotate-[15deg] hover:pl-5"
                onClick={() => setSelectedCard(card)}
              >
                <Image
                  src={card.image[0]}
                  alt={card.name}
                  className={`h-auto w-full rounded-md border-2 border-white `}
                  width={100}
                  height={100}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          {selectedCard && (
            <Image
              src={selectedCard.image[0]}
              alt={selectedCard.name}
              className="h-auto w-full cursor-pointer pr-2"
              width={100}
              height={100}
              onClick={() => routeToCardPageById(selectedCard.card_id)}
            />
          )}
          <div>
            This week's points:{' '}
            {mostRecentPoints.cards.find(
              (element) => element.card_id === selectedCard?.card_id,
            )?.total_points ?? '0'}
          </div>

          <div>
            Last week's points:{' '}
            {secondMostRecentPoints.cards.find(
              (element) => element.card_id === selectedCard?.card_id,
            )?.total_points ?? '0'}
          </div>
        </div>
      </div>
    </>
  );
}
