import { BulletinItem } from "@/app/lib/definitions";

export default function BulletinBoard({ bulletins, playerId }: { bulletins: BulletinItem[]; playerId: number }) {
    const bulletinsSorted = bulletins.sort((a, b) => a.created.valueOf() - b.created.valueOf());
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Bulletin</h1>
            <ul>
                {bulletinsSorted.map((bulletin, index) => (
                    <li key={index} className="mb-2">
                        <div className={`p-4 rounded ${playerId == bulletin.player_id ? 'bg-black text-white' : 'bg-red-100 text-red-900'}`}>
                            <div className="font-bold">{bulletin.author}</div>
                            <div dangerouslySetInnerHTML={{ __html: bulletin.message.replace(/\n/g, '<br>').replace(/\t/g, '<span style="margin-left: 40px;"></span>') }} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}