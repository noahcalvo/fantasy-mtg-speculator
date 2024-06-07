import { CardDetails } from '@/app/lib/definitions';
import Image from 'next/image';

export default function PositionCell({
  position,
  card,
}: {
  position: string;
  card: CardDetails | null;
}) {
  return (
    <div className=" h-22 mx-2 mb-2 w-full sm:w-80">
      {card ? (
        <div className="h-full w-full border border-gray-300">
          <div className="flex justify-center bg-black text-white">
            <div>{position}</div>
          </div>
          <div className="flex p-2">
            <div className="w-2/3">
              <p>{card.name}</p>
            </div>
            <div className="w-1/3">
              <Image
                src={card.image}
                alt={card.name}
                width={100}
                height={100}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full w-full border border-gray-300">
          <div className="flex justify-center bg-black text-white">
            <div>{position}</div>
          </div>
          <div className="flex p-2">
            <div className="w-2/3">
              <p>empty</p>
            </div>
            <div className="w-1/3">
            <div className='w-[100px] h-[139px] bg-gray-300 rounded-sm flex justify-center items-center border-black border'>?</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
