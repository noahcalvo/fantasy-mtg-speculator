import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { FeaturesCarouselLazy } from './ui/features-carousel-lazy';

// Simple SVG icons to replace FontAwesome
const InstagramIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.017 0C8.396 0 8.001.01 6.788.048 2.478.266.265 2.482.048 6.788.008 8.001 0 8.396 0 12.017s.01 4.016.048 5.229c.218 4.306 2.434 6.522 6.74 6.74C8.001 23.99 8.396 24 12.017 24s4.016-.01 5.229-.048c4.306-.218 6.522-2.434 6.74-6.74C23.99 16.033 24 15.638 24 12.017s-.01-4.016-.048-5.229C23.734 2.482 21.518.266 17.212.048 16.033.008 15.638 0 12.017 0zm0 5.9a6.117 6.117 0 100 12.234A6.117 6.117 0 0012.017 5.9zm0 10.117a4 4 0 110-8A4 4 0 0112.017 16.017zM17.96 5.644a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" clipRule="evenodd" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

export default function Page() {
  return (
    <main className="flex h-full flex-col justify-between bg-gray-950 font-mono">
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="grid grid-cols-4 flex-col gap-5 rounded-lg bg-white px-8 py-8 sm:grid-cols-3 md:flex md:bg-gray-50 xl:w-1/3">
          <div className="col-span-3 grid gap-4 sm:col-span-2">
            <div>
              <p className="mb-4 text-lg text-gray-800">Welcome to Spec.</p>
              <p className="text-gray-600">
                Build your fantasy MTG lineup. Draft cards, set your roster, and
                score points based on real MTGO results.
              </p>
            </div>
            <Link
              href="/login"
              className="text-mdkey flex max-w-xs items-center justify-between gap-5 self-start rounded-lg bg-gray-950 px-6 py-3 text-gray-50 transition-colors hover:bg-red-800 md:text-base"
            >
              <span>Sign up</span>
              <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
          </div>
          <Image
            src="/spec.png"
            width="100"
            height="200"
            className="mx-auto w-28 animate-fly duration-[4s] sm:my-auto sm:animate-grow md:hidden md:p-4"
            alt="spec logo of creepy guy"
            priority
            quality={75}
          />
        </div>
        <div className="flex flex-col gap-4 rounded-lg bg-gray-50 px-8 py-8 xl:w-1/3">
          <div>
            <p className="mb-4 w-full text-lg text-gray-800">Why Spec?</p>
            <p className="text-gray-600">
              We bring MTG fans together through speculation, competition, and
              community.
            </p>
          </div>
          <div className="flex flex-col items-center xl:flex-col xl:items-center">
            <Image
              src="/gooners.jpg"
              width="200"
              height="200"
              className="border-2 border-black"
              alt="spec beta testers: complete goons"
              quality={80}
              loading="lazy"
            />
            <p className="p-4 text-center text-sm text-gray-600">
              Gooners - the inspiration and motivation behind Spec.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-lg bg-gray-50 px-8 py-8 xl:w-1/3">
          <div>
            <p className="mb-4 w-full text-lg text-gray-800">Features:</p>
          </div>
          <FeaturesCarouselLazy />
        </div>
      </div>
      <footer className="pb-4 pt-12 text-gray-600">
        <div className="flex justify-center gap-4 pb-4">
          <a href="https://instagram.com/specfantasy" target="_blank">
            <InstagramIcon />
          </a>
          <a
            href="https://github.com/noahcalvo/fantasy-mtg-speculator"
            target="_blank"
          >
            <GitHubIcon />
          </a>
        </div>
        <p className="text-center">
          ㋡ {new Date().getFullYear()} Spec. All rights reserved.{' '}
          <a href="privacy" className="text-blue-500 hover:underline">
            Privacy Policy
          </a>
        </p>
      </footer>
    </main>
  );
}
