'use client';
import {
  TradeOfferWithCardDetails,
  getCardTypesAbbreviationString,
  transformTradeOffer,
} from '@/app/lib/definitions';
import { acceptTrade, declineTrade, revokeTrade } from '@/app/lib/trade';
import SmallCard from '@/app/ui/roster/smallCard';
import { useState } from 'react';
import { FaceFrownIcon } from '@heroicons/react/24/outline';

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
          className={`m-2 h-10 rounded-md border px-2  py-1 text-gray-50 ${showOffers ? 'border-gray-400 bg-gray-400 hover:border-gray-950' : 'bg-red-800 text-gray-50 hover:border-red-400'}`}
        >
          {!showOffers ? 'Show offers' : 'Hide offers'}
        </button>
      </div>
      {showOffers && (
        <div>
          <div>
            {offersReceivedByPlayer.length === 0 && (
              <div className="flex p-2">
                <FaceFrownIcon className="h-5 w-5" />
                <p className="ml-2">No incoming offers</p>
              </div>
            )}
            {offersReceivedByPlayer.length > 0 && (
              <div>
                <div className="text-md m-2 font-semibold">
                  Incoming offers:
                </div>
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
                </div>
              </div>
            )}
          </div>
          <div>
            {offersMadeByPlayer.length === 0 && (
              <div className="flex p-2">
                <FaceFrownIcon className="h-5 w-5" />
                <p className="ml-2">No outgoing offers</p>
              </div>
            )}

            {offersMadeByPlayer.length > 0 && (
              <div>
                <div className="text-md m-2 font-semibold">
                  Outgoing offers:
                </div>
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
                </div>
              </div>
            )}
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
      <div className="w-full bg-gray-950 text-center text-gray-50">
        {outgoing ? trade.recipient.name : trade.offerer.name}
      </div>
      <div className="flex place-content-around items-center border-b">
        <div className="text-center">You give</div>
        <div>You get</div>
      </div>
      <div className="m-2 flex place-content-around">
        <div className="grid sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          {giving.map((card, index) => {
            const position = getCardTypesAbbreviationString(card.typeLine);
            return (
              <div key={index} className="m-2">
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
                className="m-2 rounded-md border border-gray-50 bg-red-800 px-1 py-1  text-sm text-gray-50 hover:border-red-400"
              >
                Accept Trade
              </button>
              <button
                onClick={() => declineTrade(tradeNoDetails, playerId, leagueId)}
                className="m-2 rounded-md border border-gray-50 bg-red-800 px-1 py-1 text-sm text-gray-50 hover:border-red-400"
              >
                Decline Trade
              </button>
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => revokeTrade(tradeNoDetails, playerId, leagueId)}
                className="m-2 rounded-md border border-gray-50 bg-red-800 px-1 py-1  text-sm text-gray-50 hover:border-red-400"
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
              <div key={index} className="m-2">
                <SmallCard availablePosition={position} card={card} score={0} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
