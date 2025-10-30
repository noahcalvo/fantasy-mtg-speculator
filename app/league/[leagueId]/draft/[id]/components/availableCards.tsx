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
import { useSearchParams } from 'next/navigation';

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

  const searchParams = useSearchParams();
  const fullscreen = searchParams.get('fullscreen');

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
            className={`${fullscreen ? 'max-h-[30dvh] sm:max-h-[70dvh]' : 'max-h-[20dvh] sm:max-h-[50dvh]'} flex flex-col items-center justify-center`}
            key={card.name}
          >
            <Image
              src={card.image[0]}
              alt={card.name}
              width={fullscreen ? 125 : 125}
              height={fullscreen ? 175 : 175}
              className={`${fullscreen ? 'max-h-[50dvh] max-w-[30vw] md:max-w-[20vw]' : 'max-h-[calc(50dvh-254px)] max-w-[calc((50dvh-254px)_*_0.6)] sm:max-h-[calc(100dvh-300px)] sm:max-w-[calc(100dvh-320px)]'} cursor-pointer border-2 border-amber-500 shadow-xl shadow-amber-500 `}
              onClick={() => {
                if (card.card_id !== -1) {
                  routeToCardPageById(card.card_id);
                  return;
                }
                routeToCardPageByName(card.name);
              }}
            />
            <button
              className={`mx-2 mt-1 rounded-md border border-gray-950 p-1 text-gray-950 hover:cursor-pointer ${
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
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${fullscreen ? 'h-[50dvh] max-h-[30dvh] w-[30vw] md:max-h-[175px] md:max-w-[125px]' : 'h-[calc(50dvh-255px)] w-[calc((50dvh-255px)_*_0.7)] md:h-[calc(100dvh-300px)] md:max-h-[175px] md:w-[calc(100dvh-320px)] md:max-w-[125px]'} cursor-pointer border-2 border-amber-500 shadow-xl shadow-amber-500 `}
      />
      <button
        className={`mx-2 mt-1 rounded-md border border-gray-950 p-1 text-gray-950 hover:cursor-pointer ${
          pickDisabled
            ? 'bg-gray-500 text-gray-50'
            : 'bg-gray-50 hover:bg-red-800 hover:text-gray-50'
        }`}
        disabled={true}
        title={pickDisabled ? pickDisabledReason : 'select a card to draft'}
      >
        Draft
      </button>
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
    <div className="max-w-[400px] items-center justify-center overflow-scroll border-y-2 border-gray-950 bg-gray-950 px-2 py-1 text-gray-50">
      <div className="w-full overflow-auto shadow-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Available"
          className="max-w-48 text-md my-2 self-center border-gray-950 bg-gray-50 px-2 py-1 text-gray-950 focus:border-red-800 focus:ring-red-800"
        />
        <div className="w-full overflow-auto">
          <div className="flex flex-nowrap gap-1">
            {types.map(
              (type) =>
                type !== 'Flex' && (
                  <div key={type} className="inline">
                    <button
                      id={type}
                      className={`rounded-md border px-1 py-1  text-sm hover:cursor-pointer
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
                className="whitespace-nowrap rounded-md border border-gray-950  bg-red-800 px-1 py-1 text-sm text-gray-50 hover:cursor-pointer"
                onClick={() =>
                  setSortedBy(sortedBy === 'price' ? 'points' : 'price')
                }
              >
                {sortedBy === 'points' ? '↕️ Points' : '↕️ Price'}
              </button>
            </div>
          </div>
        </div>
        <hr className="my-2 border-gray-50" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div
              className={`overflow-scroll scrollbar scrollbar-track-gray-50 scrollbar-thumb-gray-50 ${fullscreen ? 'max-h-[calc(50dvh-140px)] md:max-h-[calc(100dvh-194px)]' : 'max-h-[calc(50dvh-250px)] md:max-h-[calc(100dvh-280px)]'}`}
            >
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
                      className={`line-clamp-3 flex overflow-scroll px-2 py-1 leading-6 ${
                        expandedCard === card.name
                          ? 'bg-gray-50 text-gray-950'
                          : ''
                      }`}
                    >
                      <div className="w-68">
                        <div className="line-clamp-1 text-sm">{card.name}</div>
                        {sortedBy === 'points' ? (
                          card.points != 0 || card.week > -1 ? (
                            <div className="flex w-full gap-2 text-sm">
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
                  </div>
                ))
              )}
            </div>
            <div className="mt-1 flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className="flex-1 rounded-md border border-gray-50 px-2 py-1 text-sm hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className="flex-1 rounded-md border border-gray-50 px-2 py-1 text-sm hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
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
