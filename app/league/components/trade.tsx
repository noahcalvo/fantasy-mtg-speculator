'use client'
import { fetchPlayerCollectionWithDetails, fetchPlayerCollectionWithPerformance } from "@/app/lib/collection";
import { CardDetails, Collection, Player, getCardTypesAbbreviationString } from "@/app/lib/definitions";
import { makeTradeOffer } from "@/app/lib/trade";
import SmallCard from "@/app/ui/roster/smallCard";
import { useState } from "react";

export default function Trade({ teamsInLeague, player, playerCollection, leagueCollections }: { teamsInLeague: Player[], player: Player, playerCollection: CardDetails[], leagueCollections: Collection[] }) {
  const [tradePartner, setTradePartner] = useState(teamsInLeague[0].player_id);
  const [ownedSelectedCards, setOwnedSelectedCards] = useState<number[]>([]);
  const [wantSelectedCards, setWantSelectedCards] = useState<number[]>([]);

  function makeOffer() {
    console.log("making an offer")
    makeTradeOffer(ownedSelectedCards, player.player_id, wantSelectedCards, tradePartner);
  }

  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTeamId = parseInt(event.target.value, 10);
    setWantSelectedCards([]);
    setTradePartner(selectedTeamId);
  };

  const handleOwnedSelectedCardsChange = (cardId: number) => {
    if (ownedSelectedCards.includes(cardId)) {
      setOwnedSelectedCards(ownedSelectedCards.filter((id) => id !== cardId));
    } else {
      setOwnedSelectedCards([...ownedSelectedCards, cardId]);
    }
  };

  const handleWantSelectedCardsChange = (cardId: number) => {
    if (wantSelectedCards.includes(cardId)) {
      setWantSelectedCards(wantSelectedCards.filter((id) => id !== cardId));
    } else {
      setWantSelectedCards([...wantSelectedCards, cardId]);
    }
  };


  // remove active player from trade partners
  teamsInLeague = teamsInLeague.filter((teamPlayer) => teamPlayer.player_id !== player.player_id);

  return (
    <div className="w-full">
      <form>
        <div className="flex place-content-between md:place-content-around mb-2 px-2">
          <div className="text-center text-md font-bold mt-0.5">{player.name}</div>
          <select name="leagueId" onChange={handleTeamChange} className="appearance-none text-center text-md font-bold py-0 px-1 focus:ring-red-800 focus:border-red-800 bg-none">
            <option value="" disabled>Select a league</option>
            {teamsInLeague.map((team: Player) => (
              <option key={team.player_id} value={team.player_id} className="text-center text-lg font-bold">
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex place-content-between md:place-content-around">
          <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3" >
            {playerCollection.map((card, index) => {
              // const points = yourCollectionPerformance.find(element => element.card_id === card?.card_id)?.total_points ?? 0
              const position = getCardTypesAbbreviationString(card.typeLine)
              return (
                <div key={index} className="flex items-center">
                  <div onClick={() => handleOwnedSelectedCardsChange(card.card_id)} className={`${ownedSelectedCards.includes(card.card_id) ? 'border-red-800' : 'border-white'} mx-2 mb-2 border border-4 rounded-md`}>
                    <SmallCard availablePosition={position} card={card} score={0} />
                  </div>
                </div>
              )
            }
            )}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {leagueCollections.filter((collection) => collection.player_id == tradePartner)[0].cards.map((card, index) => {
              // const points = yourCollectionPerformance.find(element => element.card_id === card?.card_id)?.total_points ?? 0
              const position = getCardTypesAbbreviationString(card.typeLine)
              return (
                <div key={index} className="flex items-center">
                  <div onClick={() => handleWantSelectedCardsChange(card.card_id)} className={`${wantSelectedCards.includes(card.card_id) ? 'border-red-800' : 'border-white'} mx-2 mb-2 border border-4 rounded-md`}>
                    <SmallCard availablePosition={position} card={card} score={0} />
                  </div>
                </div>
              )
            }
            )}

          </div>
        </div>
        <div className="flex justify-center">
          <div
            className="rounded bg-white px-4 py-2 text-black hover:text-white hover:bg-red-800 border hover:border-white"
            onClick={() => makeOffer()}
          >
            Make an offer
          </div>
        </div>
      </form>
    </div>)
}

function getTradePartnerName(playerId: number, teamsInLeague: Player[]): string {
  const foundPlayer = teamsInLeague.find(player => player.player_id === playerId);

  return foundPlayer?.name ?? "uh oh"
}