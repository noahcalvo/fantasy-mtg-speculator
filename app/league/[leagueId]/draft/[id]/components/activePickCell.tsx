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
  showCard,
}: {
  pick: DraftPick;
  picksTilActive: number;
  pausedAt?: string | null;
  deadlineAt?: string | null;
  showCard: boolean;
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

  let message = 'Active';
  let low = false;
  if (deadlineAt) {
    if (deadlineAt === '0') {
      // If the deadline is '0', it means the draft has not started
      message = 'Start Draft';
    } else {
      // Otherwise, show the countdown timer
      message = mmss;
      low = Boolean(deadlineAt && totalSeconds <= 30);
    }
  }

  const cardType = getCardTypesAbbreviation(cardData?.typeLine ?? '');
  return (
    <PickCell
      picksTilActive={picksTilActive}
      cardData={cardData}
      pick={pick}
      cardType={cardType}
      paused={pausedAt !== null}
      timeLabel={message}
      low={low}
      showCard={showCard}
    />
  );
}
