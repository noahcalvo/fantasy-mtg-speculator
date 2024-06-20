'use client'
import { useState } from "react";

export default function PendingOffers() {
  const [showOffers, setShowOffers] = useState(false);
  
  return (
    <div>
    <div className='flex justify-center mb-4'>
      <button onClick={() => setShowOffers(true)} className='m-2 rounded-md px-2 py-1 text-sm  border text-black border-black bg-white hover:bg-red-800 hover:text-white'>{{showOffers} ? 'Show offers' : 'Hide offers'}</button>
      </div>
      <div className='flex justify-center'>
      {showOffers && (
        <div>
          showing offers
        </div>
      )}
      </div>
    </div>
  );
};