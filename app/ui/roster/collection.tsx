import { fetchPlayerCollectionWithDetails } from "@/app/lib/collection";
import CollectionCardCell from "./collectionCardCell";

export default async function Collection({ playerId }: { playerId: number }) {
  const collection = await fetchPlayerCollectionWithDetails(playerId);
  return (
    <div className="rounded-md bg-white">
      <div>
        {collection.map((card, index) => (
          <CollectionCardCell card={card} key={index} playerId={playerId}/>
        ))}
      </div>
    </div>
  );
}
