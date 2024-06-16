import { TeamPerformance, WeeklyLeaguePerformances, calculateTotalPoints } from "@/app/lib/definitions";
import Link from "next/link";


export default async function Standings({ weeklyPerformance, }: { weeklyPerformance: WeeklyLeaguePerformances; }) {
  // Sort participants by points in descending order
  const sortedParticipants = [...weeklyPerformance.teams].sort((a, b) => calculateTotalPoints(b.cards.cards) - calculateTotalPoints(a.cards.cards));

  return (
      <div>
          {sortedParticipants.map((participant:TeamPerformance, index: number) => {
              let className = 'grid grid-cols-12 items-center p-2 rounded-md my-1 hover:underline';
              let emojiText = "   "
              if (index === 0) emojiText = '🥇';
              else if (index === 1) emojiText = '🥈';
              else if (index === 2) emojiText = '🥉';

              return (
                  <Link key={index} className={className} href={`/league/teams/${participant.player_id}`}>
                      <div className="text-right">{emojiText}</div>
                      <div className="col-span-7 text-lg text-bold">{participant.name}</div>
                      <div className="col-span-4">{calculateTotalPoints(participant.cards.cards)} points</div>
                  </Link>
              );
          })}      </div>
  );
}