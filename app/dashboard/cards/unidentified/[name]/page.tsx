import { fetchCard, fetchScryfallDataByCardName } from '@/app/lib/card';
import { error } from 'console';
import Image from 'next/image';
import BackButton from '../../components/back-button';
import GeneralCardDetails from '../../components/generalCardDetails';

export default async function Page({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  //check if cardId is a number
  const cardDetails = await fetchScryfallDataByCardName(name);
  if (!cardDetails) {
    return error();
  }
  return (
    <div>
      <BackButton />
      <div className="flex items-center p-2 text-white">
        <GeneralCardDetails cardDetails={cardDetails} />
      </div>
    </div>
  );
}
