import SpecLogo from '@/app/ui/spec-logo';
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
    <main className="flex min-h-screen flex-col bg-black p-6">
      <div className="flex shrink-0 items-end rounded-lg bg-white px-2">
        <SpecLogo />
      </div>
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-around gap-4 rounded-lg bg-gray-50 px-6 py-8 sm:px-20 md:w-1/3 md:px-6">
          <div>
            <p
              className={`text-xl text-gray-800 md:text-3xl md:leading-normal`}
            >
              <strong>Welcome to Spec.</strong>
            </p>
            <p className="text-gray-600">
              A fantasy magic the gathering platform where you can draft cards
              and set lineups of creatures, instants, enchantments, artifacts,
              and lands. Earn points based on how many copies of your cards show
              up in MTGO tournaments.
            </p>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-5 self-start rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-red-800 md:text-base"
          >
            <span>Sign up (or log in)</span>
            <ArrowRightIcon className="w-5 md:w-6" />
          </Link>
        </div>
        <div className="flex flex-col items-center justify-around gap-4 rounded-lg bg-gray-50 px-6 py-8 sm:px-20 md:w-1/3 md:px-6">
          <div>
            <p
              className={`w-full text-xl text-gray-800 md:text-3xl md:leading-normal`}
            >
              <strong>Fantasy Magic</strong>
            </p>
            <p className="text-gray-600">
              The mission is to spark connection, friendships, and community
              through competitive magic speculation.
              <br />
              Join us and experience the excitement of fantasy magic the
              gathering!{' '}
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
