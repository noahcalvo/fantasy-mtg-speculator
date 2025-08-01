import { runMondayTask } from '@/app/lib/performance';

export const dynamic = 'force-dynamic'; // static by default, unless reading the request

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.debug('Unauthorized');
    return new Response('hellow child');
  }
  console.debug('Processing rosters');
  await runMondayTask();
  return new Response(`Rosters were processed`);
}
