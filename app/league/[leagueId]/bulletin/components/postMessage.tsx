'use client';
import { postBulletinItem } from "@/app/lib/bulletin";
import { useState } from "react";

export default function PostMessage({ playerId, leagueId }: { playerId: number, leagueId: number }) {
    const [message, setMessage] = useState('');

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await postBulletinItem(leagueId, message, playerId);
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="rounded p-2 mr-2"
                placeholder="Type your message here..."
            />
            <button type="submit" className="p-2 rounded bg-red-900 text-white">Send</button>
        </form>

    )
}