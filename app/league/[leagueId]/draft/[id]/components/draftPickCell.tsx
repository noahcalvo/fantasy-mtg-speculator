import {
  CardDetails,
  DraftPick,
  getCardTypesAbbreviation,
  Player,
} from '@/app/lib/definitions';
import { fetchParticipantData } from '@/app/lib/player';
import { fetchCard } from '@/app/lib/card';
import PickCell from './pickCell';
import { useEffect, useState } from 'react';

export default function DraftPickCell({
  pick,
  picksTilActive,
}: {
  pick: DraftPick;
  picksTilActive: number;
}) {
  const [cardData, setCardData] = useState<CardDetails | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (pick?.card_id) {
      fetchCard(pick.card_id as unknown as number).then((data) => {
        setCardData(data);
      });
      fetchParticipantData(pick?.player_id).then((data) => {
        setPlayer(data);
      });
    }
  }, [pick]);

  const cardType = getCardTypesAbbreviation(cardData?.typeLine ?? '').join('/');

  if (picksTilActive === 0) {
  }

  return (
    <PickCell
      picksTilActive={picksTilActive}
      cardData={cardData}
      pick={pick}
      playerName={player?.name ?? ''}
      cardType={cardType}
    />
  );
}
