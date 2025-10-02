'use server';
import { signIn } from '@/auth';
import { sql } from '@vercel/postgres';
import { AuthError } from 'next-auth';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { redirect } from 'next/navigation';

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard',   // <-- critical
    });

    // If signIn succeeds and doesn't redirect (rare), just return no error
    return undefined;
  } catch (err) {
    if (err instanceof AuthError) {
      if (err.type === 'CredentialsSignin') return 'Invalid credentials.';
      throw err;
    }
    throw err;
  }
}


const FormSchema = z.object({
  player_id: z.string(),
  name: z.string().nonempty({
    message: 'Please enter a name.',
  }),
  email: z.string().email({
    message: 'Please provide a valid email.',
  }),
  password: z.string().min(6, {
    message: 'Please enter a password with at least 6 characters.',
  }),
});

const CreateAccount = FormSchema.omit({ player_id: true });

export type State = {
  formData: FormData;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function createAccount(
  prevState: string | undefined,
  formData: FormData,
): Promise<string> {
  // validate data from form
  const validatedFields = CreateAccount.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return 'Missing Fields. Failed to Create Account.';
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await sql`SELECT * FROM users WHERE email = ${validatedFields.data.email}`;
    if (existingUser.rowCount > 0) {
      return 'Email already in use. Please try logging in.';
    }
  } catch (error) {
    console.error('Database Error:', error);
    return 'Failed to check existing accounts.';
  }

  const { name, email, password } = validatedFields.data;
  const encrpatedPassword = await bcrypt.hash(password, 10);

  try {
    await sql`INSERT INTO users (name, email, password) VALUES (${name}, ${email}, ${encrpatedPassword})`;
  } catch (error) {
    console.error('Database Error:', error);
    return `Failed to create account for ${name}`;
  }
  redirect(`/login?created=${name}`);
}

export async function isAdmin(email: string) {
  return email === 'noah.calvo@gmail.com' || email === 'c@c.com';
}
