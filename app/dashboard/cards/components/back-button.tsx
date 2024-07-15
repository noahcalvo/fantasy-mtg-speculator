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
      className="rounded-lg bg-white pl-1 pr-1.5 text-black"
    >
      ← back
    </button>
  );
};

export default BackButton;
