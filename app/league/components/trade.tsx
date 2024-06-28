'use client'
import { CardDetails, Collection, Player, getCardTypesAbbreviationString } from "@/app/lib/definitions";
import { makeTradeOffer } from "@/app/lib/trade";
import SmallCard from "@/app/ui/roster/smallCard";
import { useState } from "react";

export default function Trade({ teamsInLeague, player, playerCollection, leagueCollections, leagueId }: { teamsInLeague: Player[], player: Player, playerCollection: CardDetails[], leagueCollections: Collection[], leagueId: number }) {
  const [tradePartner, setTradePartner] = useState(teamsInLeague[0].player_id);
  const [ownedSelectedCards, setOwnedSelectedCards] = useState<number[]>([]);
  const [wantSelectedCards, setWantSelectedCards] = useState<number[]>([]);

  function makeOffer() {
    makeTradeOffer(ownedSelectedCards, player.player_id, wantSelectedCards, tradePartner, leagueId);
    setOwnedSelectedCards([]);
    setWantSelectedCards([]);
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
      <div className="text-xl font-bold m-2 w-full border p-1 border-black border-x-0">SEND A TRADE</div>
      <form>
        <div className="flex place-content-between md:place-content-around mb-2 px-2">
          <div className="text-center text-md font-bold mt-0.5">{player.name}</div>
          <select name="leagueId" onChange={handleTeamChange} className="appearance-none text-center text-md font-bold py-0 px-1 focus:ring-red-800 focus:border-red-800 bg-none">
            <option value="" disabled>Select a team</option>
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
                  <div onClick={() => handleOwnedSelectedCardsChange(card.card_id)} className={`${ownedSelectedCards.includes(card.card_id) ? 'border-red-800' : 'border-white'} mx-2 mb-2 border-4 rounded-xl`}>
                    <SmallCard availablePosition={position} card={card} score={0} />
                  </div>
                </div>
              )
            }
            )}
          </div>
          <div className="flex justify-center">
            <button
              className={`rounded-md px-2 py-1 text-white border h-10 ${ownedSelectedCards.length === 0 || wantSelectedCards.length === 0 ? 'bg-gray-400 border-gray-400' : 'bg-red-800 border-white hover:border-red-400'}`}
              onClick={() => makeOffer()}
              disabled={ownedSelectedCards.length === 0 || wantSelectedCards.length === 0}
            >
              Make offer
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {leagueCollections.filter((collection) => collection.player_id == tradePartner)[0]?.cards.map((card, index) => {
              // const points = yourCollectionPerformance.find(element => element.card_id === card?.card_id)?.total_points ?? 0
              const position = getCardTypesAbbreviationString(card.typeLine)
              return (
                <div key={index} className="flex items-center">
                  <div onClick={() => handleWantSelectedCardsChange(card.card_id)} className={`${wantSelectedCards.includes(card.card_id) ? 'border-red-800' : 'border-white'} mx-2 mb-2 border-4 rounded-xl`}>
                    <SmallCard availablePosition={position} card={card} score={0} />
                  </div>
                </div>
              )
            }
            )}

          </div>
        </div>
      </form>
    </div>)
}