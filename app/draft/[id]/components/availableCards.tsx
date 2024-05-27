'use client';
import { useState } from 'react';
import { CardDetails } from '@/app/lib/definitions';
import Image from 'next/image';

export default function AvailableCards({
  undraftedCards,
}: {
  undraftedCards: CardDetails[];
}) {
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const cardsPerPage = 15;

  // Sort the undrafted cards by price
  const sortedCards = undraftedCards.sort((a: CardDetails, b: CardDetails) => {
    if (a.price.usd === null && b.price.usd === null) {
      return 0;
    } else if (a.price.usd === null) {
      return 1;
    } else if (b.price.usd === null) {
      return -1;
    } else {
      return b.price.usd - a.price.usd;
    }
  });

  const paginatedCards = sortedCards
    .filter((card: CardDetails) =>
      card.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice(page * cardsPerPage, (page + 1) * cardsPerPage);

  return (
    <div className="flex w-1/4 items-center justify-center border-4 border-white">
      <div className="rounded-lg border border-blue-500 p-5 text-blue-500 shadow-md">
        <h1 className="mb-4 text-2xl font-bold md:text-3xl">Available Cards</h1>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search cards"
          className="mb-4 border-blue-500 text-blue-500"
        />
        <hr className="my-2 border-blue-500" />
        {paginatedCards.map((card: CardDetails) => (
          <div
            key={card.name}
            onMouseEnter={() => setExpandedCard(card.name)}
            onMouseLeave={() => setExpandedCard(null)}
          >
            <div className="line-clamp-2 flex h-12 px-2 py-1 leading-6">
              <h2>
                {card.name} -{' '}
                {card.price.usd ? '$' + card.price.usd : 'no price data found'}
              </h2>
            </div>
            {card.name == expandedCard && (
              <div className='w-full items-center flex'>
                <Image
                  src={card.image}
                  alt={card.name}
                  width="200"
                  height="200"
                />
                  <button className='mx-2 bg-blue-500 rounded-md text-white p-2'>Draft</button>
              </div>
            )}
            <hr className="my-2 border-blue-500" />
          </div>
        ))}
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 0}
          className="mx-2 mt-2 rounded-md border border-blue-500 px-2"
        >
          Previous
        </button>
        <button
          onClick={() => setPage(page + 1)}
          disabled={(page + 1) * cardsPerPage >= sortedCards.length}
          className="mx-2 rounded-md border border-blue-500 px-2"
        >
          Next
        </button>
      </div>
    </div>
  );
}
