import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { FeaturesCarousel } from './ui/features-carousel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faInstagram,
  faSquareGithub,
} from '@fortawesome/free-brands-svg-icons';

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-950 p-6">
      <div className="flex shrink-0 flex-row items-center rounded-lg bg-white p-0 px-2 leading-none md:items-end">
        <Image
          src="/spec.png"
          width="100"
          height="200"
          className="md:animate-fly h-32 w-28 duration-[4s] md:h-[125px] md:p-4"
          alt="spec logo of creepy guy"
        />{' '}
        <p className="mx-4 text-[44px] md:hidden">Spec</p>
      </div>
      <div className="mt-4 flex grow flex-col gap-4 xl:flex-row">
        <div className="flex flex-col gap-4 rounded-lg bg-gray-50 px-8 py-8 xl:w-1/3">
          <div>
            <p className="mb-4 text-xl text-gray-800 md:text-3xl">
              <strong>Welcome to Spec.</strong>
            </p>
            <p className="text-gray-600">
              Build your fantasy MTG lineup. Draft cards, set your roster, and
              score points based on real MTGO results.
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-gray-950 px-6 py-3 text-sm font-medium text-gray-50 transition-colors hover:bg-red-800 md:text-base"
          >
            <span>Sign up (or log in)</span>
            <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-lg bg-gray-50 px-8 py-8 xl:w-1/3">
          <div>
            <p className="mb-4 w-full text-xl text-gray-800 md:text-3xl">
              <strong>Why Spec?</strong>
            </p>
            <p className="text-gray-600">
              We bring MTG fans together through speculation, competition, and
              community.
            </p>
          </div>
          <div>
            <Image
              src="/gooners.jpg"
              width="200"
              height="200"
              className="w-full border-2 border-black"
              alt="spec beta testers: complete goons"
            />
            <p className="text-xs text-gray-600">
              Gooners - the inspiration and motivation behind Spec.
            </p>
          </div>
        </div>
        <FeaturesCarousel />
      </div>
      <footer className="py-4 text-gray-600">
        <div className="flex justify-center gap-4">
          <a href="https://instagram.com/specfantasy" target="_blank">
            <FontAwesomeIcon icon={faInstagram} className="w-8" />
          </a>
          <a
            href="https://github.com/noahcalvo/fantasy-mtg-speculator"
            target="_blank"
          >
            <FontAwesomeIcon icon={faSquareGithub} className="w-8" />
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
