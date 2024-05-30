'use client'

import LoginForm from '@/app/ui/auth/login-form';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams()
 
  const success = searchParams.get('success')
  console.log(success)
  console.log(searchParams)
  return (
    <div>
      {success && <p>Account successfully created for {success}!</p>}
      <LoginForm />
    </div>
  );
}