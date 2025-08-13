'use client';
import { useEffect, useState } from 'react';
import {
  CardDetails,
  CardDetailsWithPoints,
  getAbbreviation,
  getCardTypesList,
  getRosterPositions,
} from '@/app/lib/definitions';
import Image from 'next/image';
import { routeToCardPageById, routeToCardPageByName } from '@/app/lib/routing';
import { makePick } from '@/app/lib/draft';

type SortBy = 'price' | 'points';

export default function AvailableCards({
  undraftedCards,
  playerId,
  activeDrafter,
  draftId,
  set,
  leagueId,
}: {
  undraftedCards: CardDetailsWithPoints[];
  playerId: number;
  activeDrafter: boolean;
  draftId: number;
  set: string;
  leagueId: number;
}) {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedBy, setSortedBy] = useState('price' as SortBy);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const cardsPerPage = 15;
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, sortedBy, filteredTypes]);

  const sortedCards = sortCards(sortedBy, undraftedCards);

  const filteredCards = sortedCards.filter(
    (card: CardDetails) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (getCardTypesList(card.typeLine).some((type) =>
        filteredTypes.includes(type),
      ) ||
        filteredTypes.length === 0),
  );

  const paginatedCards = filteredCards.slice(
    page * cardsPerPage,
    (page + 1) * cardsPerPage,
  );

  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  const types = getRosterPositions();

  const expandedCardDisplay = expandedCard ? (
    undraftedCards
      .filter((card) => card.name === expandedCard) // Step 1: Filter cards
      .map(
        (
          card, // Step 2: Map over filtered cards
        ) => (
          <div
            className="mt-2 flex flex-col items-center justify-center"
            key={card.name}
          >
            <Image
              src={card.image[0]}
              alt={card.name}
              width="125"
              height="173"
              className="cursor-pointer border-2 border-amber-500 shadow-xl shadow-amber-500"
              onClick={() => {
                if (card.card_id !== -1) {
                  routeToCardPageById(card.card_id);
                  return;
                }
                routeToCardPageByName(card.name);
              }}
            />
            <button
              className={`mx-2 mt-2 rounded-md border border-gray-950 p-2 text-gray-950 ${
                activeDrafter
                  ? 'bg-gray-50 hover:bg-red-800 hover:text-gray-50'
                  : 'bg-gray-500 text-gray-50'
              }`}
              disabled={!activeDrafter}
              onClick={() =>
                makePick(draftId, playerId, card.name, set, leagueId)
              }
            >
              Draft
            </button>
          </div>
        ),
      )
  ) : (
    <div className="mt-2 flex flex-col items-center justify-center">
      <div
        className="border border-amber-500 shadow-xl shadow-amber-500"
        style={{ width: '125px', height: '173px' }}
      />
    </div>
  );

  function handleNameClicked(
    e: React.MouseEvent<HTMLDivElement>,
    card: CardDetails,
  ) {
    switch (e.detail) {
      case 1:
        setExpandedCard(card.name);
        break;
      case 2:
        if (card.card_id && card.card_id >= 0) {
          routeToCardPageById(card.card_id);
          break;
        }
        routeToCardPageByName(card.name);
        break;
    }
  }

  return (
    <div className="h-full items-center justify-center overflow-auto bg-gray-950 p-2 text-gray-50">
      <div className="h-full w-full overflow-auto shadow-md">
        <div className="mb-2 grid lg:grid-cols-2">
          <h1 className="mx-2 my-2 text-2xl font-bold lg:text-3xl">
            Available Cards
          </h1>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards"
            className="max-w-48 mx-2 self-center border-gray-950 bg-gray-50 px-2 py-1 text-gray-950 focus:border-red-800 focus:ring-red-800"
          />
        </div>
        <div className="flex flex-wrap">
          {types.map(
            (type) =>
              type !== 'Flex' && (
                <div key={type} className="inline">
                  <button
                    id={type}
                    className={`m-2 rounded-md border px-1 py-1  text-sm
                  ${filteredTypes.includes(type) ? 'border-gray-950 bg-red-800 text-gray-50' : 'border-gray-950 bg-gray-50 text-gray-950'}
                `}
                    onClick={() => {
                      if (filteredTypes.includes(type)) {
                        setFilteredTypes(
                          filteredTypes.filter((t) => t !== type),
                        );
                      } else {
                        setFilteredTypes([...filteredTypes, type]);
                      }
                    }}
                  >
                    {getAbbreviation(type)}
                  </button>
                </div>
              ),
          )}
          <div className="inline">
            <button
              className="m-2 rounded-md border border-gray-950 bg-red-800  px-1 py-1 text-sm text-gray-50"
              onClick={() =>
                setSortedBy(sortedBy === 'price' ? 'points' : 'price')
              }
            >
              {sortedBy === 'points' ? '↕️ Points' : '↕️ Price'}
            </button>
          </div>
        </div>
        <hr className="my-2 border-gray-50" />
        <div className="grid grid-cols-2">
          <div>
            <div className="scrollbar-visible max-h-[25vh] overflow-auto scrollbar scrollbar-track-gray-50 scrollbar-thumb-gray-50 xl:max-h-[60vh]">
              {paginatedCards.map((card: CardDetailsWithPoints) => (
                <div
                  key={card.name}
                  onClick={(e) => handleNameClicked(e, card)}
                  className="cursor-pointer"
                >
                  <div
                    className={`line-clamp-3 flex h-12 px-2 py-1 leading-6 ${
                      expandedCard === card.name
                        ? 'bg-gray-50 text-gray-950'
                        : ''
                    }`}
                  >
                    <div className="w-full">
                      <div className="line-clamp-1">{card.name}</div>
                      {sortedBy === 'points' ? (
                        card.points ? (
                          <div className="flex w-full place-content-between">
                            <div>
                              pts:
                              <span className="rounded-md bg-red-900 px-1">
                                {card.points}
                              </span>
                            </div>
                            <div>
                              week:
                              <span className="rounded-md bg-red-900 px-1">
                                {card.week == -1 ? 0 : card.week}
                              </span>
                            </div>
                          </div>
                        ) : (
                          'no point data found'
                        )
                      ) : (
                        <div>
                          {card.price.usd
                            ? '$' + card.price.usd
                            : 'no price data found'}
                        </div>
                      )}
                    </div>
                  </div>
                  <hr className="my-2 border-gray-950" />
                </div>
              ))}
            </div>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="mx-2 mt-2 rounded-md border border-gray-50 px-2"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="mx-2 rounded-md border border-gray-50 px-2"
            >
              Next
            </button>
          </div>
          {expandedCardDisplay}
        </div>
      </div>
    </div>
  );
}

function sortCards(sortBy: SortBy, cards: CardDetailsWithPoints[]) {
  return cards.sort((a: CardDetailsWithPoints, b: CardDetailsWithPoints) => {
    // When sorting by points, consider week as part of the sorting criteria
    if (sortBy === 'points') {
      // First, compare by week, descending (latest week is most valuable)
      if (a.week !== b.week) {
        return b.week - a.week; // Sort by week in descending order
      }
      // If weeks are the same, then sort by points, descending
      return b.points - a.points;
    } else if (sortBy === 'price') {
      // Sorting by price logic remains unchanged
      if (a.price.usd === null && b.price.usd === null) {
        return 0;
      } else if (a.price.usd === null) {
        return 1;
      } else if (b.price.usd === null) {
        return -1;
      } else {
        return b.price.usd - a.price.usd;
      }
    }
    // Default to sorting by points if sortBy is not recognized
    return b.points - a.points;
  });
}

// async function makePickAPICall(
//   draftId: number,
//   playerId: number,
//   cardName: string,
//   set: string,
// ) {
//   const res = await fetch('/api/makePick', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ draftId, playerId, cardName, set }),
//   });
//   const json = await res.json();
// }
