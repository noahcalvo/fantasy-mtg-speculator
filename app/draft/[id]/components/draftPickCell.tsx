import { DraftPick, getCardTypesAbbreviation } from '@/app/lib/definitions';
import { fetchParticipantData } from '@/app/lib/player';
import { fetchCard } from '@/app/lib/card';
import PickCell from './completedPickCell';

export default async function draftPickCell({
  pick,
  picksTilActive,
}: {
  pick: DraftPick;
  picksTilActive: number;
}) {
  let cardData = null;
  if (pick.card_id) {
    cardData = await fetchCard(pick.card_id as unknown as number);
  }
  const player = await fetchParticipantData(pick.player_id);

  const cardType = getCardTypesAbbreviation(cardData?.typeLine ?? '').join('/');

  return (
    <PickCell
      picksTilActive={picksTilActive}
      cardData={cardData}
      pick={pick}
      playerName={player.name}
      cardType={cardType}
    />
  );
}
