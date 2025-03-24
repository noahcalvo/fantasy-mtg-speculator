'use client';
import {
  CardDetails,
  Collection,
  Player,
  getCardTypesAbbreviationString,
} from '@/app/lib/definitions';
import { routeToCardPageById } from '@/app/lib/routing';
import { makeTradeOffer } from '@/app/lib/trade';
import SmallCard from '@/app/ui/roster/smallCard';
import { useState } from 'react';

export default function Trade({
  teamsInLeague,
  player,
  playerCollection,
  leagueCollections,
  leagueId,
}: {
  teamsInLeague: Player[];
  player: Player;
  playerCollection: CardDetails[];
  leagueCollections: Collection[];
  leagueId: number;
}) {
  const [tradePartner, setTradePartner] = useState(teamsInLeague[0].player_id);
  const [ownedSelectedCards, setOwnedSelectedCards] = useState<number[]>([]);
  const [wantSelectedCards, setWantSelectedCards] = useState<number[]>([]);
  const [loadingMakeOffer, setLoadingMakeOffer] = useState(false);

  async function makeOffer() {
    setLoadingMakeOffer(true);
    await makeTradeOffer(
      ownedSelectedCards,
      player.player_id,
      wantSelectedCards,
      tradePartner,
      leagueId,
    );
    window.location.reload();
    setLoadingMakeOffer(false);
    setOwnedSelectedCards([]);
    setWantSelectedCards([]);
    // refresh the page to show new trade offer
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

  function handleCardClicked(
    e: React.MouseEvent<HTMLDivElement>,
    cardId: number,
    owned: boolean,
  ) {
    switch (e.detail) {
      case 1:
        if (owned) handleOwnedSelectedCardsChange(cardId);
        else handleWantSelectedCardsChange(cardId);
        break;
      case 2:
        routeToCardPageById(cardId);
        break;
    }
  }

  // remove active player from trade partners
  teamsInLeague = teamsInLeague.filter(
    (teamPlayer) => teamPlayer.player_id !== player.player_id,
  );

  if (teamsInLeague.length === 0) {
    return (
      <div className="py-8 text-center">No other teams in this league</div>
    );
  }

  if (loadingMakeOffer) {
    return <div>Sending offer...</div>;
  }

  return (
    <div className="w-full">
      <div className="m-2 w-full border border-x-0 border-black p-1 text-xl font-bold">
        SEND A TRADE
      </div>
      <form>
        <div className="mb-2 flex place-content-between px-2 md:place-content-around">
          <div className="text-md mt-0.5 text-center font-bold">
            {player.name}
          </div>
          <select
            name="leagueId"
            onChange={handleTeamChange}
            className="text-md appearance-none bg-none px-1 py-0 text-center font-bold focus:border-red-800 focus:ring-red-800"
          >
            <option value="" disabled>
              Select a team
            </option>
            {teamsInLeague.map((team: Player) => (
              <option
                key={team.player_id}
                value={team.player_id}
                className="text-center text-lg font-bold"
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex place-content-between items-start md:place-content-around">
          <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {playerCollection.map((card, index) => {
              const position = getCardTypesAbbreviationString(card.typeLine);
              return (
                <div key={index} className="flex items-center">
                  <div
                    onClick={(e) => handleCardClicked(e, card.card_id, true)}
                    className={`${ownedSelectedCards.includes(card.card_id) ? 'border-red-800' : 'border-white'} mx-2 mb-2 rounded-xl border-4`}
                  >
                    <SmallCard
                      availablePosition={position}
                      card={card}
                      score={0}
                      onClick={false}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center">
            <button
              className={`h-10 rounded-md border px-2 py-1 text-gray-50 ${ownedSelectedCards.length === 0 || wantSelectedCards.length === 0 ? 'border-gray-400 bg-gray-400 hover:border-gray-950' : 'border-white bg-red-800 hover:border-red-400'}`}
              onClick={() => makeOffer()}
              disabled={
                ownedSelectedCards.length === 0 ||
                wantSelectedCards.length === 0
              }
            >
              Make offer
            </button>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {leagueCollections
              .filter((collection) => collection.player_id == tradePartner)[0]
              ?.cards.map((card, index) => {
                const position = getCardTypesAbbreviationString(card.typeLine);
                return (
                  <div key={index} className="flex items-center">
                    <div
                      onClick={(e) => handleCardClicked(e, card.card_id, false)}
                      className={`${wantSelectedCards.includes(card.card_id) ? 'border-red-800' : 'border-white'} mx-2 mb-2 rounded-xl border-4`}
                    >
                      <SmallCard
                        availablePosition={position}
                        card={card}
                        score={0}
                        onClick={false}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </form>
    </div>
  );
}
