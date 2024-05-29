'use client';
import Search from '@/app/ui/search';
import { Card, CardPoint } from '@/app/lib/definitions';
import {
  fetchCardPerformanceByWeek,
  fetchPlayerCollection,
} from '@/app/lib/collection';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCurrentWeek } from '@/app/lib/utils';
import { InvoiceSkeleton, InvoicesTableSkeleton } from '../skeletons';

export default function CardTable({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const [cardDataLoading, setCardDataLoading] = useState(false);
  const [collectionDataLoading, setCollectionDataLoading] = useState(false);
  const searchParams = useSearchParams();
  const weekParam = searchParams.get('week');
  const week = weekParam === '0' ? 0 : Number(weekParam) || getCurrentWeek();
  const [collection, setCollection] = useState<Card[]>([]);
  const [cardPoints, setCardPoints] = useState<CardPoint[]>([]);

  useEffect(() => {
    setCollectionDataLoading(true);
    fetchPlayerCollection(email)
      .then((result) => {
        setCollection(result.rows);
        setCollectionDataLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch card data:', error);
        setCollectionDataLoading(false);
      });
  }, [email]);

  useEffect(() => {
    setCardDataLoading(true);
    fetchCardPerformanceByWeek(
      collection.map((card) => Number(card.card_id)),
      week,
    )
      .then((result) => {
        const resultSet = new Set(result.map((card) => card.name));
        const missingCards = collection
          .filter((card) => !resultSet.has(card.name))
          .map((card) => ({
            name: card.name,
            total_points: 0,
          }));
        result.push(...missingCards);
        setCardPoints(result);
        setCardDataLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch card data:', error);
        setCardDataLoading(false);
      });
  }, [collection, week]);

  return (
    <div className="">
      <h1 className="mb-8 text-xl md:text-2xl">{name}&apos;s Collection</h1>
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <table className="min-w-full rounded-md text-gray-900">
                <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <tr>
                    <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-5 font-medium">
                      Week {week} Points
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-900">
                  {cardDataLoading && <InvoiceSkeleton />}
                  {cardPoints?.map((card) => (
                    <tr key={card.name} className="group">
                      <td className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <p>{card.name}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {card.total_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
