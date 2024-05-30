import { DraftPick } from "./definitions";

export function getActivePick(picks: DraftPick[]) {
    // Step 1: Sort the picks array
    picks.sort((a, b) => {
      if (a.round !== b.round) {
        return a.round - b.round;
      }
      return a.pick_number - b.pick_number;
    });
  
    // Step 2: Find the first pick without a card_id
    return picks.find((pick) => !pick.card_id);
  }
  