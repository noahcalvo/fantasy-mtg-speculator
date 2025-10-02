'use client';
import { ScryfallSearchResponse } from '@/app/lib/definitions';
import { routeToCardPageByName } from '@/app/lib/routing';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';

const CardSearchBar = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [results, setResults] = useState<ScryfallSearchResponse | null>(null);

  // Debounce the query to limit API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      // encode the query to ensure it is URL safe
      const encodedQuery = encodeURIComponent(query);
      setDebouncedQuery(encodedQuery);
    }, 1000); // 1 second debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch data from the Scryfall API
  useEffect(() => {
    if (debouncedQuery) {
      fetch(`https://api.scryfall.com/cards/search?q=${debouncedQuery}`)
        .then((response) => response.json())
        .then((data) => {
          setResults(data);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }
  }, [debouncedQuery]);

  return (
    <div className="relative flex items-center justify-center hover:cursor-pointer">
      <input
        type="text"
        placeholder="Search for a card"
        className="text-md h-8 rounded-lg border border-gray-950 bg-gray-50 p-2 pl-8 focus:outline-none"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <MagnifyingGlassIcon className="absolute left-2 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-950" />
      {results && results.data.length > 0 && (
        <ul className="absolute top-full z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border-2 border-black bg-gray-50">
          {results.data.map((card) => (
            <li
              key={card.id}
              className="cursor-pointer p-2 hover:bg-gray-200"
              onClick={() => routeToCardPageByName(card.name)}
            >
              {card.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CardSearchBar;
