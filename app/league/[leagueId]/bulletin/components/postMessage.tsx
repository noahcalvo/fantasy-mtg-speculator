'use client';
import { postBulletinItem } from '@/app/lib/bulletin';
import { useState } from 'react';

export default function PostMessage({
  playerId,
  leagueId,
}: {
  playerId: number;
  leagueId: number;
}) {
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.debug(message);
    await postBulletinItem(leagueId, message, playerId);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex">
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            console.debug(message);
          }}
          className="max-w-70 mr-2 w-full rounded border-2 border-gray-950 p-2"
          placeholder="Type your message here..."
        />
        <button
          type="submit"
          className="rounded border-2 border-gray-950 px-4 py-2 text-gray-950 hover:cursor-pointer hover:bg-red-900 hover:text-gray-50"
        >
          Send
        </button>
      </div>
    </form>
  );
}
