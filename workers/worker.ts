import { fetchAutoDraftTime, fetchMostValuableUndraftedCard, getActivePick, makePick } from "@/app/lib/draft";

export async function draftWorker(draftId: number, set: string, playerId?: number, cardName?: string) {
  // Make the pick
  if (playerId && cardName) {
    await makePick(draftId, playerId, cardName, set);
  } else {
    const mostValuableCard = await fetchMostValuableUndraftedCard(draftId);
    const activePick = await getActivePick(draftId);
    if (!activePick) {
      console.log("No next pick available");
      return; // Exit condition
    }
    await makePick(draftId, activePick.player_id, mostValuableCard.name, set);
  }

  const pickTime = await fetchAutoDraftTime(draftId);
  if (pickTime) {
    console.log("Auto-drafting in progress, with picktime: ", pickTime);
    // Wait for a delay before making the next pick and add it to the timerMap
    // e.g. "draftId1 => timeout"
    setTimeout(() => {
      draftWorker(draftId, set);
    }, pickTime * 1000);
  } else {
    console.log("Draft not set up to autodraft");
  }
}