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
    console.log(message);
    await postBulletinItem(leagueId, message, playerId);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          console.log(message);
        }}
        className="mr-2 rounded p-2"
        placeholder="Type your message here..."
      />
      <button type="submit" className="rounded bg-red-900 p-2 text-gray-50">
        Send
      </button>
    </form>
  );
}
