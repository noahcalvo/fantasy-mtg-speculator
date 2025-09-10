import {
  CardDetails,
  DraftPick,
  getCardTypesAbbreviation,
} from '@/app/lib/definitions';
import { fetchCard } from '@/app/lib/card';
import PickCell from './pickCell';
import { useEffect, useState } from 'react';
import { useCountdown } from './useCountdown';

export default function ActivePickCell({
  pick,
  picksTilActive,
  paused,
  deadlineAt,
}: {
  pick: DraftPick;
  picksTilActive: number;
  paused?: boolean;
  deadlineAt?: string | null;
}) {
  const [cardData, setCardData] = useState<CardDetails | null>(null);

  useEffect(() => {
    if (pick?.card_id) {
      fetchCard(pick.card_id as unknown as number).then((data) => {
        setCardData(data);
      });
    }
  }, [pick]);

  const { totalSeconds, mmss } = useCountdown(deadlineAt, paused);

  const cardType = getCardTypesAbbreviation(cardData?.typeLine ?? '').join('/');

  return (
    <PickCell
      picksTilActive={picksTilActive}
      cardData={cardData}
      pick={pick}
      cardType={cardType}
      paused={paused}
      timeLabel={mmss}
      totalSeconds={totalSeconds}
    />
  );
}
