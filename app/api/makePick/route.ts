import { fetchAutoDraftTime, fetchMostValuableUndraftedCard, getActivePick, makePick } from "@/app/lib/draft";

let timerMap = new Map();

// Step 2: Define the recursive auto-draft function
async function draft(draftId: number, set: string, playerId?: number, cardName?: string) {
  // Make the pick
  if (playerId && cardName) {
    await makePick(draftId, playerId, cardName, set);
  }
  else {
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
    timerMap.set(draftId, setTimeout(() => draft(draftId, set), pickTime * 1000));
  }
  else {
    console.log("Draft not set up to autodraft");
  }

}

// Modified POST function to initiate auto-drafting
export async function POST(req: Request): Promise<Response> {
  try {
    const data = await req.json();
    const { draftId, playerId, cardName, set } = data;
    if (timerMap.has(draftId)) {
      clearTimeout(timerMap.get(draftId));
    }

    // Start auto-drafting for subsequent picks
    draft(draftId, set, playerId, cardName);

    // Return a response to indicate the process has started
    return new Response(JSON.stringify({
      message: "Drafting process initiated",
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({
      message: err || "An error occurred",
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}