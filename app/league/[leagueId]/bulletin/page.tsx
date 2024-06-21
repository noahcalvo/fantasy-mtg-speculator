import { fetchBulletinItems } from "@/app/lib/bulletin";

export default async function Page({ params }: { params: { leagueId: string } }) {
  const leagueId = isNaN(parseInt(params.leagueId, 10)) ? -1 : parseInt(params.leagueId, 10);
  const bulletins = await fetchBulletinItems(leagueId);
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bulletin</h1>
      <ul>
        {bulletins.map((bulletin, index) => (
          <li key={index} className="mb-2">
            <div className="p-4 rounded bg-red-100 text-red-900">
            <div dangerouslySetInnerHTML={{ __html: bulletin.message.replace(/\n/g, '<br>').replace(/\t/g, '<span style="margin-left: 40px;"></span>')}} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}