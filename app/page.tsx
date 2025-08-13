import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { FeaturesCarouselLazy } from './ui/features-carousel-lazy';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons';

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
              src="/gooners_200x200.jpg"
              width="200"
              height="200"
              className="border-2 border-black"
              alt="spec beta testers: complete goons"
              priority
              quality={80}
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
            <FontAwesomeIcon icon={faInstagram} className="w-8" />
          </a>
          <a
            href="https://github.com/noahcalvo/fantasy-mtg-speculator"
            target="_blank"
          >
            <FontAwesomeIcon icon={faGithub} className="w-8" />
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
