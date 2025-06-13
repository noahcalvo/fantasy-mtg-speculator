'use client';
import { routeToCardPageById } from '../lib/routing';
import Image from 'next/image';

export default function ClickableCard({
  source,
  id,
  name,
}: {
  source: string;
  id: number;
  name: string;
}) {
  return (
    <button onClick={() => routeToCardPageById(id)}>
      <Image
        src={source}
        alt={name}
        width={100}
        height={100}
        className="mx-2 mt-2"
      />
    </button>
  );
}
