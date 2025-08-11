import { BulletinItem } from '@/app/lib/definitions';

export default function BulletinBoard({
  bulletins,
  playerId,
}: {
  bulletins: BulletinItem[];
  playerId: number;
}) {
  const bulletinsSorted = bulletins.sort(
    (a, b) => a.created.valueOf() - b.created.valueOf(),
  );
  return (
    <div className="mb-8">
      <h1 className="mb-4 text-2xl font-bold">Bulletin</h1>
      <ul className="max-h-[70vh] overflow-y-auto overflow-x-hidden">
        {bulletinsSorted.map((bulletin, index) => (
          <li key={index} className="mb-2">
            <div
              className={`rounded p-4 ${playerId == bulletin.player_id ? 'bg-gray-950 text-gray-50' : 'bg-red-100 text-red-900'}`}
            >
              <div className="font-bold">{bulletin.author}</div>
              <div
                dangerouslySetInnerHTML={{
                  __html: bulletin.message
                    .replace(/\n/g, '<br>')
                    .replace(/\t/g, '<span style="margin-left: 40px;"></span>'),
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
