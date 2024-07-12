import { fetchCard } from '@/app/lib/card';
import { error } from 'console';
import Image from 'next/image';
import BackButton from './components/back-button';

export default async function Page({ params }: { params: { id: string } }) {
  const cardId = parseInt(params.id);
  //check if cardId is a number
  if (isNaN(cardId)) {
    return error();
  }
  const cardDetails = await fetchCard(cardId);
  if (!cardDetails) {
    return error();
  }
  return (
    <div>
      <BackButton />
      <div className="flex items-center p-2 text-white">
        <Image
          src={cardDetails.image}
          alt={cardDetails.name}
          width={250}
          height={250}
        />
        {cardDetails.name}
      </div>
    </div>
  );
}
