import Link from "next/link";
import DraftInfoHeader from "./components/draftInfoHeader";
import { fetchDraft } from "@/app/lib/draft";
import notFound from "./not-found";

export default async function Layout({ children, params }: { children: React.ReactNode, params: { id: string } }) {
    const draftId = params.id;
    const draft = await fetchDraft(draftId);
    if (!draft) {
      return notFound();
    }    
    return (
        <div>
        <main>
        <div className="flex p-2 items-center">
          <div className="w-28">
          <Link
            href="/draft"
            className="rounded-md bg-white px-1 py-1 text-sm text-black transition-colors hover:bg-red-800 hover:text-white border-white border"
          >
            All drafts
          </Link>
        </div>
        <DraftInfoHeader draft={draft}/>
        </div>
        {children}
        </main>
        </div>
    );
  }