'use client';
import Pusher from 'pusher-js';

let _pusher: Pusher | null = null;
const users = new Map<string, number>();

export function getPusher(): Pusher {
  if (_pusher) return _pusher;
  if (process.env.NODE_ENV !== 'production') Pusher.logToConsole = true;
  _pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
  });
  return _pusher;
}

export function acquireChannel(name: string) {
  const p = getPusher();
  const ch = p.channel(name) ?? p.subscribe(name);
  const n = (users.get(name) ?? 0) + 1;
  users.set(name, n);
  // debug
  console.log(`[rt] acquire "${name}" -> ${n} listeners`);
  return ch;
}

export function releaseChannel(name: string) {
  const p = getPusher();
  const n = (users.get(name) ?? 1) - 1;
  if (n <= 0) {
    users.delete(name);
    p.unsubscribe(name);
    console.log(`[rt] release "${name}" -> unsubscribed`);
  } else {
    users.set(name, n);
    console.log(`[rt] release "${name}" -> ${n} listeners remain`);
  }
}
