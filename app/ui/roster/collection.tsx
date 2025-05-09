'use client';
import { CardDetails, CardPerformances } from '@/app/lib/definitions';
import { routeToCardPageById } from '@/app/lib/routing';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';

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
    <div className="p-4 text-gray-50">
      <h2 className="text-xl">Bench</h2>
      <div className="grid w-full grid-cols-4 text-gray-50">
        <div />
        <div />
        <div className="text-gray-50">This week</div>
        <div className="text-gray-50">Last week</div>
      </div>
      <div className="w-full">
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
    <div className="flex w-full">
      <li
        key={card.name}
        onClick={() => routeToCardPageById(card.card_id)}
        className="grid w-full cursor-pointer grid-cols-4 text-gray-50 hover:bg-red-900"
      >
        <div className="col-span-2 line-clamp-1 overflow-hidden text-gray-50">
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
