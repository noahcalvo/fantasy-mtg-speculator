'use client';

import {
  CheckBadgeIcon,
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon, ArrowLeftIcon } from '@heroicons/react/20/solid';
import { Button } from '../button';
import { useFormState, useFormStatus } from 'react-dom';
import { createAccount } from '@/app/lib/accountAuth';

export default function SignupForm() {
  const [errorMessage, dispatch] = useFormState(createAccount, undefined);

  return (
    <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
      <a href="/login">
        <Button className="float-right mb-4 justify-between">
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Login
        </Button>
      </a>
      <h1 className="mb-4 w-full text-2xl">Create Account</h1>

      <form action={dispatch}>
        <div>
          <div className="w-full">
            <div>
              <label
                className="mb-2 ml-1 mt-6 block text-xs font-medium text-gray-950"
                htmlFor="name"
              >
                Name
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-black py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
                  id="name"
                  type="name"
                  name="name"
                  placeholder="Enter your name"
                  required
                />
                <CheckBadgeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-950" />
              </div>
            </div>

            <div className="mt-4">
              <label
                className="mb-2 ml-1 block text-xs font-medium text-gray-950"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-black py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  required
                />
                <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-950" />
              </div>
            </div>
            <div className="mb-4 mt-4">
              <label
                className="mb-2 ml-1 block text-xs font-medium text-gray-950"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="peer block w-full rounded-md border border-black py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-950" />
              </div>
            </div>
          </div>
          <SignupButton />
          <div
            className="mt-2 flex items-center space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{String(errorMessage)}</p>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function SignupButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      Sign up <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
