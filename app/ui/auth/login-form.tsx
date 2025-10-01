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

export default function LoginForm({ announce }: { announce?: string }) {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-6">
      {!announce && (
        <a href="/signup">
          <Button className="mb-8 w-full bg-red-800 hover:bg-red-950">
            Create New Account
          </Button>
        </a>
      )}

      <p className="mb-6 font-semibold text-black">{announce}</p>

      <form action={dispatch}>
        <div>
          <div className="w-full">
            <div>
              <label
                className="mb-2 ml-1 block text-xs font-medium text-black"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <input
                  className="text-md peer block w-full rounded-md border border-black py-[9px] pl-10 outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  required
                />
                <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black" />
              </div>
            </div>
            <div className="mt-4">
              <label
                className="mb-2 ml-1 mt-6 block text-xs font-medium text-black"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <input
                  className="text-md peer block w-full rounded-md border border-black py-[9px] pl-10 outline-2 placeholder:text-gray-500 focus:border-red-800 focus:ring-red-800"
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
            className="mt-4 flex items-end space-x-1"
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
    </div>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-10 w-full" aria-disabled={pending}>
      Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}
