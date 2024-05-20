import { Card } from "@/app/ui/dashboard/cards";
import { fetchPlayerCollectionWithPerformance } from "@/app/lib/collection";

export default async function BestPerformerBadge({email}: {email: string}){
    const collectionPerformance = await fetchPlayerCollectionWithPerformance(email);
    return (
        <Card title={`Your Weekly (week ${collectionPerformance[0].week}) Best Performing Card`} value={`${collectionPerformance[0].name} - ${collectionPerformance[0].total_points}`} type="collected" paragraphSize="10px"/>
     );
}