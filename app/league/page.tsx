import { auth } from "@/auth";
import { fetchPlayerByEmail } from "../lib/player";
import { fetchLeague } from "../lib/leagues";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const player = await fetchPlayerByEmail(user?.email ?? '')
  const playerId = player.player_id
  const league = await fetchLeague(playerId);
  if (league?.league_id) {
    {redirect(`/league/${league?.league_id}/teams/${playerId}`)}
  }
    return (
      <main className="">
      </main>
    );
  }