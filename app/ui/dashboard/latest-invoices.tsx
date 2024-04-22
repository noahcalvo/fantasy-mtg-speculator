import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import { CardPoint } from '@/app/lib/definitions';
export default async function LatestInvoices({
  collection,
}: {
  collection: CardPoint[];
}) {
  return (
    <div className="flex w-full">
      <h2 className="mb-4 text-xl md:text-2xl">
        Latest Invoices
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        {/* NOTE: comment in this code when you get to this point in the course */}

        <div className="bg-white px-6">
          {collection.map((card, i) => {
            return (
              <div
                key={card.name}
                className={clsx(
                  'flex flex-row items-center justify-between py-4',
                  {
                    'border-t': i !== 0,
                  },
                )}
              >
                <div className="flex items-center">
                  {/* <Image
                    src={invoice.image_url}
                    alt={`${invoice.name}'s profile picture`}
                    className="mr-4 rounded-full"
                    width={32}
                    height={32}
                  /> */}
                  <div>image goes here</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {card.name}
                    </p>
                    <p className="hidden text-sm text-gray-500 sm:block">
                      email goes here
                    </p>
                  </div>
                </div>
                <p
                  className="truncate text-sm font-medium md:text-base"
                >
                  {card.total_points}
                </p>
              </div>
            );
          })}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}
