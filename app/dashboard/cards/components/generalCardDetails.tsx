import { CardDetails } from '@/app/lib/definitions';
import Image from 'next/image';

export default function GeneralCardDetails({
  cardDetails,
}: {
  cardDetails: CardDetails;
}) {
  return (
    <div className="flex flex-col items-start text-white">
      <div className="my-2 flex flex-col items-center text-white">
        {cardDetails.image.length > 1 ? (
          <div className="flex">
            <div className="flex items-center">
              <Image
                src={cardDetails.image[0]}
                alt={cardDetails.name}
                width={200}
                height={200}
                className="w-1/2"
              />
              <Image
                src={cardDetails.image[1]}
                alt={cardDetails.name}
                width={200}
                height={200}
                className="w-1/2"
              />
            </div>
          </div>
        ) : (
          <Image
            src={cardDetails.image[0]}
            alt={cardDetails.name}
            width={250}
            height={150}
          />
        )}
      </div>
    </div>
  );
}
