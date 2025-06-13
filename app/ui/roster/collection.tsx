'use client';
import { CardDetails, CardPerformances } from '@/app/lib/definitions';
import { routeToCardPageById } from '@/app/lib/routing';
import { RectangleStackIcon } from '@heroicons/react/24/outline';

export default function Bench({
  benchCollection,
  mostRecentPoints,
  secondMostRecentPoints,
}: {
  playerId: number;
  leagueId: number;
  benchCollection: CardDetails[];
  mostRecentPoints: CardPerformances;
  secondMostRecentPoints: CardPerformances;
}) {
  return (
    <div className="flex flex-col rounded-xl bg-gray-950 p-2 text-gray-50 shadow-sm">
      <div className="flex p-2">
        <RectangleStackIcon className="h-5 w-5 text-gray-50" />
        <p className="ml-2 text-md">Bench</p>
      </div>
      <div className="grid w-full grid-cols-6 text-sm text-gray-50">
        <div />
        <div />
        <div />
        <div />
        <div className="text-gray-50">This week</div>
        <div className="text-gray-50">Last</div>
      </div>
      <div className="w-full p-2">
        {benchCollection.map((card) => (
          <Collection
            key={card.name}
            mostRecentPoints={mostRecentPoints}
            secondMostRecentPoints={secondMostRecentPoints}
            card={card}
          />
        ))}
      </div>
    </div>
  );
}

type FeatureButtonProps = {
  mostRecentPoints: CardPerformances;
  card: CardDetails;
  secondMostRecentPoints: CardPerformances;
};

function Collection({
  mostRecentPoints,
  secondMostRecentPoints,
  card,
}: FeatureButtonProps) {
  return (
    <div className="flex w-full text-sm">
      <li
        key={card.name}
        onClick={() => routeToCardPageById(card.card_id)}
        className="grid w-full cursor-pointer grid-cols-6 text-gray-50 hover:bg-red-900"
      >
        <div className="col-span-4 line-clamp-1 overflow-hidden text-gray-50">
          {card.name}
        </div>
        <div className="text-gray-50">
          {mostRecentPoints.cards.find(
            (element) => element.card_id === card?.card_id,
          )?.total_points ?? '0'}
        </div>
        <div className="text-gray-50">
          {secondMostRecentPoints.cards.find(
            (element) => element.card_id === card?.card_id,
          )?.total_points ?? '0'}
        </div>
      </li>
    </div>
  );
}
