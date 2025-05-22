import { Card } from '@/app/ui/dashboard/cards';
import { fetchPlayerCollection } from '@/app/lib/collection';

export default async function TotalCardsBadge({
  playerId,
  leagueId,
}: {
  playerId: number;
  leagueId: number;
}) {
  const collection = await fetchPlayerCollection(playerId, leagueId);
  return (
    <Card title="Cards Owned" value={collection.length} type="collected" />
  );
}
