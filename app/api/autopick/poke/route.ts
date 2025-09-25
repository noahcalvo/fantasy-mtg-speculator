import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { autopickIfDue } from "@/app/lib/draft"; // your tx from earlier

export const runtime = "nodejs"; // we need Node to talk to Postgres

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: Request) {
  // 1) Verify signature from QStash
  const signature = req.headers.get("Upstash-Signature") ?? "";
  const bodyText = await req.text();

  const ok = await receiver.verify({
    signature,
    body: bodyText,
    url: `${process.env.APP_BASE_URL}/api/autopick/poke`,
  });
  if (!ok) return new NextResponse("invalid signature", { status: 401 }); // hard fail
  const { draftId } = JSON.parse(bodyText) as { draftId: number };

  // 2) Run the idempotent, race-safe autopick
  //    (advisory lock + UNIQUE(draft_id, pick_no) inside processOneDraft)
  await autopickIfDue(draftId);

  return new NextResponse(null, { status: 204 });
}
