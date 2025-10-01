'use client';
import { useRouter } from 'next/navigation';

const BackButton = () => {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  return (
    <button
      onClick={goBack}
      className="rounded-lg border-2 border-red-900 bg-gray-50 pl-1 pr-1.5 text-gray-950 hover:cursor-pointer"
    >
      ← back
    </button>
  );
};

export default BackButton;
