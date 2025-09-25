'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  CardDetails,
  CardDetailsWithPoints,
  getAbbreviation,
  getCardTypesList,
  getRosterPositions,
} from '@/app/lib/definitions';
import Image from 'next/image';
import { routeToCardPageById, routeToCardPageByName } from '@/app/lib/routing';
import { getActivePick, makePick } from '@/app/lib/draft';
import { useDraftRealtime } from './useDraftRealtime';
import { sortCardsByPoints, sortCardsByPrice } from '@/app/lib/utils';

type SortBy = 'price' | 'points';

export default function AvailableCards({
  undraftedCards,
  playerId,
  activeDrafter,
  draftId,
  set,
  leagueId,
  isPaused,
}: {
  undraftedCards: CardDetailsWithPoints[];
  playerId: number;
  activeDrafter: boolean;
  draftId: number;
  set: string;
  leagueId: number;
  isPaused: boolean;
}) {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedBy, setSortedBy] = useState('price' as SortBy);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const cardsPerPage = 15;
  const [filteredTypes, setFilteredTypes] = useState<string[]>([]);
  const [paused, setPaused] = useState(isPaused);
  const [isActiveDrafter, setIsActiveDrafter] = useState(activeDrafter);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, sortedBy, filteredTypes]);

  const sortedCards = sortCards(sortedBy, undraftedCards);
  console.log('Sorted cards:', sortedCards);

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

  const pickDisabled = !isActiveDrafter || paused;
  const pickDisabledReason = !isActiveDrafter
    ? 'Not your turn'
    : paused
      ? 'Draft paused'
      : '';

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
                pickDisabled
                  ? 'bg-gray-500 text-gray-50'
                  : 'bg-gray-50 hover:bg-red-800 hover:text-gray-50'
              }`}
              disabled={pickDisabled}
              title={pickDisabled ? pickDisabledReason : ''}
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

  // Stable fetcher so our WS handlers don't capture stale closures
  const fetchData = useCallback(async () => {
    try {
      const activePick = await getActivePick(draftId);
      setIsActiveDrafter(activePick?.player_id == playerId);
    } catch (error) {
      console.error('Error fetching active pick:', error);
    }
  }, [draftId, playerId]);

  useDraftRealtime(
    draftId,
    {
      paused: () => setPaused(true),
      resumed: () => setPaused(false),
      pick_made: (msg?: any) => {
        fetchData();
      },
    },
    'availableCards',
  );
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
            <div className="max-h-[25vh] overflow-scroll scrollbar scrollbar-track-gray-50 scrollbar-thumb-gray-50 xl:max-h-[60vh]">
              {paginatedCards.length == 0 ? (
                <p className="p-4 text-gray-50">No cards available</p>
              ) : (
                paginatedCards.map((card: CardDetailsWithPoints) => (
                  <div
                    key={card.name}
                    onClick={(e) => handleNameClicked(e, card)}
                    className="cursor-pointer"
                  >
                    <div
                      className={`line-clamp-3 flex px-2 py-1 leading-6 ${
                        expandedCard === card.name
                          ? 'bg-gray-50 text-gray-950'
                          : ''
                      }`}
                    >
                      <div className="w-full">
                        <div className="line-clamp-1 text-sm">{card.name}</div>
                        {sortedBy === 'points' ? (
                          card.points != 0 || card.week > -1 ? (
                            <div className="flex w-full place-content-between text-sm">
                              <div>
                                {card.points != 0 ? (
                                  <p>
                                    pts:
                                    <span className="rounded-md bg-red-900 px-1 text-gray-50">
                                      {card.points}
                                    </span>
                                  </p>
                                ) : (
                                  <p className="mx-2 rounded-md bg-red-900 px-1 text-gray-50">
                                    no points scored in your league settings
                                  </p>
                                )}
                              </div>
                              <div>
                                week:
                                <span className="rounded-md bg-red-900 px-1 text-gray-50">
                                  {card.week == -1 ? 0 : card.week}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">no point data found</div>
                          )
                        ) : (
                          <div className="text-sm">
                            {card.price.usd
                              ? '$' + card.price.usd
                              : 'no price data found'}
                          </div>
                        )}
                      </div>
                    </div>
                    <hr className="my-2 border-gray-950" />
                  </div>
                ))
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="flex-1 rounded-md border border-gray-50 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="flex-1 rounded-md border border-gray-50 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
          {expandedCardDisplay}
        </div>
      </div>
    </div>
  );
}

function sortCards(sortBy: SortBy, cards: CardDetailsWithPoints[]) {
  if (sortBy === 'points') {
    return sortCardsByPoints(cards);
  } else if (sortBy === 'price') {
    return sortCardsByPrice(cards);
  } else {
    console.error('Invalid sortBy value:', sortBy);
    return cards;
  }
}
