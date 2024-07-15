export function routeToCardPageById(cardId: number) {
  window.location.href = `/dashboard/cards/${cardId}`;
}

export function routeToCardPageByName(cardName: string) {
const encodedCardName = encodeURIComponent(cardName);
  window.location.href = `/dashboard/cards/unidentified/${encodedCardName}`;
}
