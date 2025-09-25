import {
  CardDetails,
  DraftPick,
  getCardTypesAbbreviation,
} from '@/app/lib/definitions';
import { fetchCard } from '@/app/lib/card';
import PickCell from './pickCell';
import { useEffect, useState } from 'react';

export default function DraftPickCell({
  pick,
  picksTilActive,
  paused,
  timeLabel,
  totalSeconds,
}: {
  pick: DraftPick;
  picksTilActive: number;
  paused?: boolean;
  timeLabel?: string; // e.g., "0:43" or "Paused"
  totalSeconds?: number; // remaining seconds
}) {
  const [cardData, setCardData] = useState<CardDetails | null>(null);

  useEffect(() => {
    if (pick?.card_id) {
      fetchCard(pick.card_id as unknown as number).then((data) => {
        setCardData(data);
      });
    }
  }, [pick]);

  const cardType = getCardTypesAbbreviation(cardData?.typeLine ?? '').join('/');

  return (
    <PickCell
      picksTilActive={picksTilActive}
      cardData={cardData}
      pick={pick}
      cardType={cardType}
      paused={paused}
      timeLabel={timeLabel}
      low={false}
    />
  );
}
