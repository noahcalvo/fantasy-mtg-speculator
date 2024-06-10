'use client';
import { League } from '@/app/lib/definitions';
import React, { useState, useEffect } from 'react';

export default function JoinLeague({ leagues }: { leagues: League[] }) {
  const [showJoin, setShowJoin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle the form submission to join the league
  };

  return (
    <div>
      <button onClick={() => {setShowJoin(true); setShowCreate(false);}} className='m-2 rounded-md px-2 py-1 text-sm  border text-black border-black bg-white hover:bg-red-800 hover:text-white'>Join League</button>
      <button onClick={() => {setShowCreate(true); setShowJoin(false);}} className='m-2 rounded-md px-2 py-1 text-sm  border text-black border-black bg-white hover:bg-red-800 hover:text-white'>Create League</button>
      {showJoin && (
        <div>
          <form onSubmit={handleJoin}>
            <select>
              {leagues.map((league: any) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
            <button type="submit" className='m-2 rounded-md px-2 py-1 text-sm  border text-black border-black bg-white hover:bg-red-800 hover:text-white'>Join</button>
          </form>
        </div>
      )}
      {showCreate && (
        <div>
          <form onSubmit={handleJoin}>
            <input type='text' placeholder='League Name' />
            <button type="submit" className='m-2 rounded-md px-2 py-1 text-sm  border text-black border-black bg-white hover:bg-red-800 hover:text-white'>Create</button>
          </form>
        </div>
      )}
    </div>
  );
};