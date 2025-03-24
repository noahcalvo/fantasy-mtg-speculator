import { fetchCardId } from './card';

export function routeToCardPageById(cardId: number) {
  window.location.href = `/dashboard/cards/${cardId}`;
}

export async function routeToCardPageByName(cardName: string) {
  const cardId = await fetchCardId(cardName);
  if (cardId != -1) {
    routeToCardPageById(cardId);
    return;
  }
  const encodedCardName = encodeURIComponent(cardName);
  window.location.href = `/dashboard/cards/unidentified/${encodedCardName}`;
}
