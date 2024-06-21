import { BulletinItem } from "@/app/lib/definitions";

export default function BulletinBoard({ bulletins }: { bulletins: BulletinItem[] }) {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Bulletin</h1>
            <ul>
                {bulletins.map((bulletin, index) => (
                    <li key={index} className="mb-2">
                        <div className="p-4 rounded bg-red-100 text-red-900">
                            <div className="font-bold">{bulletin.author}</div>
                            <div dangerouslySetInnerHTML={{ __html: bulletin.message.replace(/\n/g, '<br>').replace(/\t/g, '<span style="margin-left: 40px;"></span>') }} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}