import SpecLogo from '../ui/spec-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex items-center justify-center bg-gray-950 md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex shrink-0 items-end rounded-lg bg-gray-50 px-2 md:h-36">
          <SpecLogo />
        </div>
        {children}
      </div>
    </main>
  );
}
