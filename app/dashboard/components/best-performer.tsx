import { Card } from "@/app/ui/dashboard/cards";
import { fetchPlayerCollectionWithPerformance } from "@/app/lib/collection";

export default async function BestPerformerBadge({email}: {email: string}){
    const collectionPerformance = await fetchPlayerCollectionWithPerformance(email);
    const week = collectionPerformance[0]?.week ? ` (week ${collectionPerformance[0]?.week})` : "";
    const cardValue = collectionPerformance[0]?.week ? `${collectionPerformance[0]?.name} - ${collectionPerformance[0]?.total_points}` : "no data";
    return (
        <Card title={`Your Weekly${week} Best Performing Card`} value={cardValue} type="collected" paragraphSize="10px"/>
     );
}