// lib/realtimeClient.ts (client)
'use client';
import Pusher from 'pusher-js';

let _pusher: Pusher | null = null;

export function getPusher() {
  if (_pusher) return _pusher;
  if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
    console.error('Missing NEXT_PUBLIC_PUSHER_* env vars');
  }
  // Optional debug (dev only)
  if (process.env.NODE_ENV !== 'production') {
    Pusher.logToConsole = true;
  }

  _pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
    // leave transports default so it can fall back if WS is blocked
    // enabledTransports: ['ws', 'wss'],
  });

  return _pusher;
}
