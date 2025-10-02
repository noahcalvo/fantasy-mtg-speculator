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
      className="rounded-lg border-red-900 bg-gray-50 pl-2 pr-2.5 text-gray-950 hover:cursor-pointer hover:bg-red-900 hover:text-gray-50"
    >
      ← back
    </button>
  );
};

export default BackButton;
