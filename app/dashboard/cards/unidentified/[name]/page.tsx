import { fetchScryfallDataByCardName } from '@/app/lib/card';
import { error } from 'console';
import BackButton from '../../components/back-button';
import GeneralCardDetails from '../../components/generalCardDetails';
import CardSearchBar from '../../components/cardSearchBar';
import OwnerShipDetails from '../../components/ownershipDetails';
import CardPerformanceChart from '../../components/cardPerformanceChart';

export default async function Page({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  //check if cardId is a number
  const cardDetails = await fetchScryfallDataByCardName(name);
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
        <OwnerShipDetails cardId={-1} />
        <CardPerformanceChart cardId={-1} />
      </div>
    </div>
  );
}
