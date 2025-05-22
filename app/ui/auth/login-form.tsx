'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '../button';
import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/accountAuth';

export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
      <form action={dispatch} className="space-y-3">
        <div>
          <h1 className="mb-4 text-2xl">Please log in to continue.</h1>
          <div className="w-full">
            <div>
              <label
                className="mb-4 mt-6 block text-xs font-medium text-black"
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
                <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black" />
              </div>
            </div>
            <div className="mt-4">
              <label
                className="mb-4 mt-6 block text-xs font-medium text-black"
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
                <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black" />
              </div>
            </div>
          </div>
          <LoginButton />
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      </form>
      <a href="/signup">
        <Button className="w-full">Create New Account</Button>
      </a>
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
