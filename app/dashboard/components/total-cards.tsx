import { Card } from "@/app/ui/dashboard/cards";
import { fetchPlayerCollection } from "@/app/lib/collection";

export default async function TotalCardsBadge({playerId}: {playerId: number}){
    const collection = await fetchPlayerCollection(playerId);
    return (
        <Card title="Total Cards In Your Collection" value={collection.rows.length} type="collected"/>
     );
}