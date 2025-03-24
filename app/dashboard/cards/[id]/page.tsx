import { fetchCard } from '@/app/lib/card';
import { error } from 'console';
import BackButton from '../components/back-button';
import GeneralCardDetails from '../components/generalCardDetails';
import OwnerShipDetails from '../components/ownershipDetails';
import CardPerformanceChart from '../components/cardPerformanceChart';
import CardSearchBar from '../components/cardSearchBar';

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
      <div className="flex justify-between">
        <BackButton />
        <CardSearchBar />
      </div>
      <div className="flex flex-col items-center p-2 text-gray-50">
        <GeneralCardDetails cardDetails={cardDetails} />
        <OwnerShipDetails cardId={cardId} />
        <CardPerformanceChart cardId={cardId} />
      </div>
    </div>
  );
}
