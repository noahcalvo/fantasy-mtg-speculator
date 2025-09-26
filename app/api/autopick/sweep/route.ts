import { NextResponse } from "next/server";
import pg from "pg";
import { autopickIfDue } from "@/app/lib/draft";
export const runtime = "nodejs";

const pool = new pg.Pool({ connectionString: process.env.POSTGRES_URL });

export async function POST() {
  const { rows } = await pool.query(
    `SELECT draft_id FROM DraftsV4
      WHERE active = true
        AND paused_at IS NULL
        AND current_pick_deadline_at <= NOW()
      LIMIT 25`
  );
  for (const r of rows) await autopickIfDue(r.draft_id);
  return NextResponse.json({ processed: rows.length });
}
