import { CardDetails, CardPoint } from '@/app/lib/definitions';
import Image from 'next/image';

export default function PositionCell({
  position,
  card,
  scoreOne,
  scoreTwo
}: {
  position: string;
  card: CardDetails | null;
  scoreOne: CardPoint;
  scoreTwo: CardPoint;
}) {
  return (
    <div className=" h-22 mx-2 mb-2 w-full text-sm sm:w-80">
      <div className="h-full w-full border border-gray-300">
        <div className="flex justify-center bg-black text-white">
          <div>{position}</div>
        </div>
        <div className="flex p-2">
          <div className="w-2/3">
            <p className="line-clamp-2 text-ellipsis font-bold sm:text-lg text-center">
              {card ? card.name : 'empty'}
            </p>
            {card ? (
              <div>
                <div className="mr-2 border border-gray-300">
                  <div className="flex justify-center">
                    <div>week {scoreOne?.week} points</div>
                  </div>
                  <p className="bg-black text-center text-white">
                    {scoreOne?.total_points || 0}
                  </p>
                </div>
                <div className='h-2'/>
                <div className="mr-2 border border-gray-300">
                  <div className="flex justify-center">
                    <div>week {scoreTwo?.week} points</div>
                  </div>
                  <p className="bg-black text-center text-white">
                    {scoreTwo?.total_points || 0}
                  </p>
                </div>

              </div>
            ) : (
              <div />
            )}
          </div>
          <div className="w-1/3">
            {card ? (
              <Image
                src={card.image}
                alt={card.name}
                width={100}
                height={100}
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
