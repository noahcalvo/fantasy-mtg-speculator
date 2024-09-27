import { LightLoading } from '@/app/ui/loadingSpinner';

export default function Loading() {
  return (
    <div className="flex w-full items-center justify-center py-5">
      <LightLoading />
    </div>
  );
}
