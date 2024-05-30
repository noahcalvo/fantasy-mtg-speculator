'use client';
import LoginForm from '@/app/ui/auth/login-form';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPageContent />
      </Suspense>
    </div>
  );
}

function LoginPageContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');

  console.log(success);
  console.log(searchParams);

  return (
    <div>
      {success && <p>Account successfully created for {success}!</p>}
      <LoginForm />
    </div>
  );
}