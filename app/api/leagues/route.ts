// 'use server'  (not required here)
import { NextResponse } from "next/server";
import { createLeague } from "@/app/lib/leagues"; // your server/db code

export async function POST(req: Request) {
  try {
    const { leagueName, userId, isPrivate } = await req.json();
    const res = await createLeague(leagueName, userId, isPrivate); // returns {ok, leagueId}|{ok:false,error}
    return NextResponse.json(res, { status: res.ok ? 200 : 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Failed" }, { status: 400 });
  }
}
