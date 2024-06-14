import { TeamPerformance, WeeklyLeaguePerformances, calculateTotalPoints } from "@/app/lib/definitions";


export default async function Standings({ weeklyPerformance }: { weeklyPerformance: WeeklyLeaguePerformances }) {
  // Sort participants by points in descending order
  const sortedParticipants = [...weeklyPerformance.teams].sort((a, b) => calculateTotalPoints(b.cards.cards) - calculateTotalPoints(a.cards.cards));

  return (
      <div>
          {sortedParticipants.map((participant:TeamPerformance, index: number) => {
              let className = 'standing';
              if (index === 0) className += ' bg-amber-500';
              else if (index === 1) className += ' bg-gray-400';
              else if (index === 2) className += ' bg-yellow-900';

              return (
                  <div key={index} className={className}>
                      <div>{index + 1}. {participant.name}</div>
                      <div>{calculateTotalPoints(participant.cards.cards)} points</div>
                  </div>
              );
          })}
      </div>
  );
}