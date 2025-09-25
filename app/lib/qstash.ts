// app/lib/qstash.ts
import { Client } from "@upstash/qstash";
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.POSTGRES_URL });
// Only instantiate if we’re in prod
const qstash =
  process.env.NODE_ENV === "development"
    ? new Client({ token: process.env.QSTASH_TOKEN! })
    : null;

export async function scheduleAutodraftOnce(draftId: number) {
  console.log(`Scheduling autopick for draft ${draftId}`);
  const { rows: [d] } = await pool.query(
    `SELECT current_pick_deadline_at FROM DraftsV4 WHERE draft_id=$1`,
    [draftId]
  );
  const deadline = d?.current_pick_deadline_at && new Date(d.current_pick_deadline_at);
  if (!deadline) return null;

  // Add 2s grace
  const graceMs = 2000;
  const scheduledAt = new Date(deadline.getTime() + graceMs);

  if (!qstash) {
    console.log(
      `[DEV] Would schedule autopick for draft ${draftId} at ${deadline.toISOString()}`
    );
    return null;
  }

  const res = await qstash.publishJSON({
    url: `${process.env.APP_BASE_URL}/api/autopick/poke`,
    notBefore: Math.floor(scheduledAt.getTime() / 1000), // run at deadline
    method: "POST",
    body: { draftId },
  });

  await pool.query(
    `UPDATE DraftsV4 SET qstash_message_id = $2 WHERE draft_id = $1`,
    [draftId, res.messageId]
  );
  return res.messageId as string;
}

export async function cancelAutodraftIfScheduled(draftId: number) {
  console.log(`Cancelling autopick for draft ${draftId}`);
  const { rows: [d] } = await pool.query(
    `SELECT qstash_message_id FROM DraftsV4 WHERE draft_id=$1`,
    [draftId]
  );
  const id = d?.qstash_message_id as string | null;
  if (!id) return;
  if (!qstash) {
    console.log(
      `[DEV] Would cancel autopick for message ${id} for draft ${draftId}`
    );
    return null;
  }
  try { await qstash.messages.delete(id); } catch { }
  await pool.query(
    `UPDATE DraftsV4 SET qstash_message_id = NULL WHERE draft_id=$1`,
    [draftId]
  );
}
