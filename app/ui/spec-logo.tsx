import Image from 'next/image';

export default function SpecLogo() {
  return (
    <div className="flex flex-row items-center p-0 leading-none text-black">
      <Image
        src="/spec.png"
        width="100"
        height="200"
        className="h-32 w-28 -rotate-90 md:h-[125px] md:rotate-0"
        alt="spec logo of creepy guy"
      />
      <p className="mx-4 text-[44px]">Spec</p>
    </div>
  );
}
