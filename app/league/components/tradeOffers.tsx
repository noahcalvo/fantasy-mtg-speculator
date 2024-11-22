'use client';
import {
  TradeOfferWithCardDetails,
  getCardTypesAbbreviationString,
  transformTradeOffer,
} from '@/app/lib/definitions';
import { acceptTrade, declineTrade, revokeTrade } from '@/app/lib/trade';
import SmallCard from '@/app/ui/roster/smallCard';
import { useState } from 'react';

export default function TradeOffers({
  offers,
  playerId,
  leagueId,
}: {
  offers: TradeOfferWithCardDetails[];
  playerId: number;
  leagueId: number;
}) {
  const [showOffers, setShowOffers] = useState(false);
  const offersMadeByPlayer = offers.filter(
    (offer) =>
      offer.offerer.player_id === playerId && offer.state === 'pending',
  );
  const offersReceivedByPlayer = offers.filter(
    (offer) =>
      offer.recipient.player_id === playerId && offer.state === 'pending',
  );
  return (
    <div>
      <div className="mb-4 flex justify-center">
        <button
          onClick={() => setShowOffers(!showOffers)}
          className={`m-2 rounded-md border border-black px-2  py-1 text-sm text-black ${showOffers ? 'bg-gray-50 text-black' : 'bg-red-800 text-white'}`}
        >
          {!showOffers ? 'Show offers' : 'Hide offers'}
        </button>
      </div>
      {showOffers && (
        <div>
          <div>
            <div className="m-2 text-xl font-bold">INCOMING TRADES:</div>
            <div className="mb-8 grid grid-cols-1 gap-2 xl:grid-cols-2">
              {offersReceivedByPlayer.map((trade, index) => {
                return (
                  <Trade
                    outgoing={false}
                    trade={trade}
                    key={index}
                    playerId={playerId}
                    leagueId={leagueId}
                  />
                );
              })}
              {offersReceivedByPlayer.length === 0 && (
                <div className="text-center">No incoming trades</div>
              )}
            </div>
          </div>
          <div>
            <div className="m-2 text-xl font-bold">OUTGOING TRADES:</div>
            <div className="mb-8 grid grid-cols-1 gap-2 xl:grid-cols-2">
              {offersMadeByPlayer.map((trade, index) => {
                return (
                  <Trade
                    outgoing={true}
                    trade={trade}
                    key={index}
                    playerId={playerId}
                    leagueId={leagueId}
                  />
                );
              })}
              {offersMadeByPlayer.length === 0 && (
                <div className="text-center">No outgoing trades</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Trade({
  trade,
  outgoing,
  playerId,
  leagueId,
}: {
  trade: TradeOfferWithCardDetails;
  outgoing: boolean;
  playerId: number;
  leagueId: number;
}) {
  const tradeNoDetails = transformTradeOffer(trade);
  const giving = outgoing ? trade.offeredCards : trade.requestedCards;
  const getting = outgoing ? trade.requestedCards : trade.offeredCards;
  return (
    <div className="border border-black">
      <div className="w-full bg-black text-center text-white">
        {outgoing ? trade.recipient.name : trade.offerer.name}
      </div>
      <div className="flex place-content-around items-center border-b">
        <div className="text-center">giving</div>
        <div>getting</div>
      </div>
      <div className="m-1 flex place-content-around">
        <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          {giving.map((card, index) => {
            const position = getCardTypesAbbreviationString(card.typeLine);
            return (
              <div key={index} className="m-1">
                <SmallCard availablePosition={position} card={card} score={0} />
              </div>
            );
          })}
        </div>
        <div>
          {!outgoing ? (
            <div className="text-center">
              <button
                onClick={() => acceptTrade(tradeNoDetails, playerId, leagueId)}
                className="m-2 rounded-md border border-white bg-red-800 px-1 py-1  text-sm text-white hover:border-red-400"
              >
                Accept Trade
              </button>
              <button
                onClick={() => declineTrade(tradeNoDetails, playerId, leagueId)}
                className="m-2 rounded-md border border-white bg-red-800 px-1 py-1 text-sm text-white hover:border-red-400"
              >
                Decline Trade
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => revokeTrade(tradeNoDetails, playerId, leagueId)}
                className="m-2 rounded-md border border-white bg-red-800 px-1 py-1  text-sm text-white hover:border-red-400"
              >
                Revoke
              </button>
            </div>
          )}
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          {getting.map((card, index) => {
            const position = getCardTypesAbbreviationString(card.typeLine);
            return (
              <div key={index} className="m-1">
                <SmallCard availablePosition={position} card={card} score={0} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
