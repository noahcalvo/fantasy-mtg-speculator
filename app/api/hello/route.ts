import { runMondayTask } from "@/app/lib/performance";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
 
export async function GET(req: Request) {
  const secretKey = req.headers.get('x-cron-secret-key');
  console.log(secretKey);
  console.log(process.env.CRON_SECRET_KEY);

  if (secretKey !== process.env.CRON_SECRET_KEY) {
    return new Response("hellow child");;
  }

  await runMondayTask();
  return new Response(`Rosters were processed`);
}