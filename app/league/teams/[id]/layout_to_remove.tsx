import Link from "next/link";
import { fetchDraft } from "@/app/lib/draft";
import { auth } from "@/auth";

export default async function Page({ children, params }: { children: React.ReactNode, params: { id: string } }) {
    const playerId = params.id;
    return (
        <div>
        {playerId}
        </div>
    );
  }