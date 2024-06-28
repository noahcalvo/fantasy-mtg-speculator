import { fetchPlayerCollectionWithDetails } from "@/app/lib/collection";
import CollectionCardCell from "./collectionCardCell";
import { fetchLeague } from "@/app/lib/leagues";

export default async function Collection({ playerId }: { playerId: number }) {
  const league = await fetchLeague(playerId)
  const collection = await fetchPlayerCollectionWithDetails(playerId, league?.league_id ?? 0);
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
