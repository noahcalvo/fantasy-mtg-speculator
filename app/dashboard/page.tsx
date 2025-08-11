import PointChart from '@/app/ui/dashboard/point-chart';
import { fetchUnreleasedSets } from '../lib/sets';
import Image from 'next/image';

export default async function Page() {
  const sets = await fetchUnreleasedSets();
  return (
    <main className="grid gap-8 md:m-8 xl:grid-cols-2">
      <section>
        <div className="mb-4 text-lg text-gray-50 md:text-xl">Top Cards</div>
        <div className="mt-6">
          <PointChart />
        </div>
      </section>

      <section>
        <div className="mb-4 text-lg text-gray-50 md:text-xl">
          Upcoming Sets
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sets.map((set) => (
            <a
              key={set.code}
              className="flex flex-col justify-between rounded-lg bg-gray-50 p-4 text-gray-950 shadow-md transition-shadow hover:bg-gray-300 hover:shadow-lg"
              href={set.scryfall_uri}
              target="_blank"
            >
              <h3 className="text-md font-semibold text-gray-950">
                {set.name}
              </h3>
              <div className="mt-4 flex gap-4">
                {set.icon && (
                  <Image
                    src={set.icon}
                    alt={`${set.name} icon`}
                    width={32} // You can adjust the width and height as needed
                    height={32}
                    unoptimized
                  />
                )}
                <div>
                  <p className="text-sm text-gray-600">
                    Release Date:{' '}
                    {new Date(set.releaseDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
