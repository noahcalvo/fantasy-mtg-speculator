import { fetchBulletinItems, postBulletinItem } from "@/app/lib/bulletin";
import { fetchPlayerByEmail } from "@/app/lib/player";
import { auth } from "@/auth";
import BulletinBoard from "./components/bulletinBoard";
import PostMessage from "./components/postMessage";

export default async function Page({ params }: { params: { leagueId: string } }) {
  const leagueId = isNaN(parseInt(params.leagueId, 10)) ? -1 : parseInt(params.leagueId, 10);
  const user = await auth().then((res) => res?.user);
  const player = await fetchPlayerByEmail(user?.email ?? '')
  const playerId = player.player_id
  const bulletins = await fetchBulletinItems(leagueId);

  return (
    <div className="p-4">
      <BulletinBoard bulletins={bulletins} />
      <PostMessage playerId={playerId} leagueId={leagueId} />
    </div>
  );
}