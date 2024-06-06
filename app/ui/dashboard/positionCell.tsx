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
    <div className='border border-gray-300 m-2 flex p-2 justify-between'>
      <div>{position}</div>
      {card ? (
        <div>
          <div>{card.name}</div>
          <Image src={card.image} alt={card.name} width={100} height={100} />
        </div>
      ) : (
        <div>Empty</div>
      )}
    </div>
  );
}
