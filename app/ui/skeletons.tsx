export function TopCardSkeleton() {
  return (
    <div
      className={`relative w-full animate-pulse overflow-hidden md:col-span-4`}
    >
      <div className="mb-4 h-8 w-36 rounded-md bg-gray-900" />
      <div className="rounded-xl bg-gray-900 p-4">
        <div className="mt-0 grid h-[410px] grid-cols-12 items-end gap-2 rounded-md bg-gray-950 p-4 sm:grid-cols-13 md:gap-4" />
        <div className="flex items-center pb-2 pt-6">
          <div className="h-5 w-5 rounded-full bg-gray-800" />
          <div className="ml-2 h-4 w-20 rounded-md bg-gray-800" />
        </div>
      </div>
    </div>
  );
}
