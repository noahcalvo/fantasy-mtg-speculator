export default function Loading() {
  return (
    <div className="flex items-center justify-center p-8 text-white">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
      <span className="ml-4">loading</span>
    </div>
  );
}
