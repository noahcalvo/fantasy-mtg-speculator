import { CardDetails, CardPoint } from '@/app/lib/definitions';
import Image from 'next/image';

export default function SmallCard({
  availablePosition,
  card,
  score,
}: {
  availablePosition: string;
  card: CardDetails | null;
  score: number;
}) {
  return (
    <div className="w-30 text-sm sm:w-50 border overflow-auto rounded-md">
      <div className="h-full w-full overflow-auto">
        <div className="flex justify-center overflow-auto">
          <div>{availablePosition}</div>
        </div>
        <div className="flex md:p-2">
          {/* <div className="w-2/3">
            <p className="line-clamp-2 text-ellipsis text-center">
              {card ? card.name : 'empty'}
            </p>
          </div> */}
          <div>
            {card ? (
              <Image
                src={card.image}
                alt={card.name}
                width={93}
                height={130}
              />
            ) : (
              <div className="flex w-full h-full min-h-[50px] items-center justify-center rounded-sm border border-black bg-gray-300">
                ?
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
