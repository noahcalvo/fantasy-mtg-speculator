import Image from 'next/image';

export default function SpecLogo() {
  return (
    <div
      className="flex flex-row items-center leading-none text-black p-0"
    >
      <Image src="/spec.png" width="100" height="200" className="w-28 -rotate-90 h-32 md:rotate-0 md:h-[125px]" alt="spec logo of creepy guy"/>
      <p className="text-[44px] mx-4">Spec,</p>
    </div>
  );
}
