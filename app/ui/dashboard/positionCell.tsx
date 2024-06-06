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
    <div>
      {card ? (
        <div className="m-2 flex justify-between border border-gray-300 p-2">
          <div>
          <div>{position}</div>
          <div>{card.name}</div>
</div>
          <div>
            <Image src={card.image} alt={card.name} width={100} height={100} />
          </div>
        </div>
      ) : (
        <div className="m-2 flex justify-between border border-gray-300 p-2">
          <div>{position}</div>
          <div>Empty</div>
        </div>
      )}
    </div>
  );
}
