import { fetchPlayerCollectionWithDetails } from "@/app/lib/collection";
import CollectionCardCell from "./collectionCardCell";
import { fetchLeague } from "@/app/lib/leagues";

export default async function Collection({ playerId }: { playerId: number }) {
  const league = await fetchLeague(playerId)
  const leagueId = league?.league_id ?? 0;
  const collection = await fetchPlayerCollectionWithDetails(playerId, leagueId);
  return (
    <div className="rounded-md bg-white">
      <div>
        {collection.map((card, index) => (
          <CollectionCardCell card={card} key={index} playerId={playerId} leagueId={leagueId}/>
        ))}
      </div>
    </div>
  );
}
