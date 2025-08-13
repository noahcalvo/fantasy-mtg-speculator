'use client';
import { ScryfallSearchResponse } from '@/app/lib/definitions';
import { routeToCardPageByName } from '@/app/lib/routing';
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
    <div className="relative flex items-center justify-center">
      <input
        type="text"
        placeholder="Search for a card"
        className="h-8 rounded-lg border-gray-950 bg-gray-50 px-2"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
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
