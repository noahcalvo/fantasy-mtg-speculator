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
  return (
    <div className="rounded-md bg-gray-50 p-4">
      <h2 className="text-xl">Full Collection</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="right">This week</TableCell>
            <TableCell align="right">Last week</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {collection.map((card) => (
            <TableRow
              key={card.name}
              onClick={() => routeToCardPageById(card.card_id)}
              className="cursor-pointer hover:bg-gray-100"
            >
              <TableCell
                component="th"
                scope="row"
                className="line-clamp-1 overflow-hidden"
              >
                {card.name}
              </TableCell>
              <TableCell align="right">
                {mostRecentPoints.cards.find(
                  (element) => element.card_id === card?.card_id,
                )?.total_points ?? '0'}
              </TableCell>
              <TableCell align="right">
                {secondMostRecentPoints.cards.find(
                  (element) => element.card_id === card?.card_id,
                )?.total_points ?? '0'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
