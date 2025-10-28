import SpecLogo from '../ui/spec-logo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="md:h-dvh flex items-center justify-center bg-gray-950">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex shrink-0 items-end rounded-lg bg-white px-2 md:h-36">
          <SpecLogo />
        </div>
        {children}
      </div>
    </main>
  );
}
