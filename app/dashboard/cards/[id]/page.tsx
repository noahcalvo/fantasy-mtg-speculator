import { fetchCard } from '@/app/lib/card';
import { error } from 'console';
import BackButton from '../components/back-button';
import GeneralCardDetails from '../components/generalCardDetails';

export default async function Page({ params }: { params: { id: string } }) {
  const cardId = parseInt(params.id);
  //check if cardId is a number
  if (isNaN(cardId) || cardId < 0) {
    return error();
  }
  const cardDetails = await fetchCard(cardId);
  if (!cardDetails) {
    return error();
  }
  return (
    <div>
      <BackButton />
      <div className="flex flex-col items-center p-2 text-white">
        <GeneralCardDetails cardDetails={cardDetails} />
      </div>
    </div>
  );
}
