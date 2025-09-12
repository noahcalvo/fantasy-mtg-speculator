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
  pausedAt,
  deadlineAt,
}: {
  pick: DraftPick;
  picksTilActive: number;
  pausedAt?: string | null;
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

  const { totalSeconds, mmss } = useCountdown(deadlineAt, pausedAt);

  const cardType = getCardTypesAbbreviation(cardData?.typeLine ?? '').join('/');
  return (
    <PickCell
      picksTilActive={picksTilActive}
      cardData={cardData}
      pick={pick}
      cardType={cardType}
      paused={pausedAt !== null}
      timeLabel={mmss}
      totalSeconds={totalSeconds}
    />
  );
}
