import { CardDetails, CardPoint } from '@/app/lib/definitions';
import { routeToCardPageById } from '@/app/lib/routing';
import Image from 'next/image';

export default function SmallCard({
  availablePosition,
  card,
  score,
  onClick = true,
}: {
  availablePosition: string;
  card: CardDetails | null;
  score: number;
  onClick?: boolean;
}) {
  return (
    <div className="w-30 sm:w-50 overflow-auto rounded-md border text-sm">
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
                src={card.image[0]}
                alt={card.name}
                width={93}
                height={130}
                onClick={() => {
                  onClick ? routeToCardPageById(card.card_id) : null;
                }}
                className="cursor-pointer"
              />
            ) : (
              <div className="flex h-full min-h-[50px] w-full items-center justify-center rounded-sm border border-black bg-gray-300">
                ?
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
