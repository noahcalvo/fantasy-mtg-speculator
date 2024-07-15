import { CardDetails } from '@/app/lib/definitions';
import Image from 'next/image';

export default function GeneralCardDetails({
  cardDetails,
}: {
  cardDetails: CardDetails;
}) {
  const name = cardDetails.name.split('//');

  return (
    <div className="flex flex-col items-start text-white">
      <div className="my-2 flex flex-col items-center text-white">
        {cardDetails.image.length > 1 ? (
          <div className="flex">
            <div className="flex items-center">
              <div className="relative">
                <Image
                  src={cardDetails.image[0]}
                  alt={cardDetails.name}
                  fill={true}
                />
              </div>
              <Image
                src={cardDetails.image[1]}
                alt={cardDetails.name}
                width={175}
                height={150}
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
