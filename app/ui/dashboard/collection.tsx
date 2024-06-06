import { fetchPlayerCollectionWithDetails } from "@/app/lib/collection";
import CollectionCardCell from "./collectionCardCell";

export default async function Collection({ email }: { email: string }) {
  const collection = await fetchPlayerCollectionWithDetails(email);
  return (
    <div className="rounded-md bg-white">
      <div>
        {collection.map((card, index) => (
          <CollectionCardCell card={card} key={index} email={email}/>
        ))}
      </div>
    </div>
  );
}
