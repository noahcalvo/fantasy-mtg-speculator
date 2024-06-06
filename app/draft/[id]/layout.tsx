import Link from "next/link";
import DraftInfoHeader from "./components/draftInfoHeader";
import { fetchDraft } from "@/app/lib/draft";
import notFound from "./not-found";
import { auth } from "@/auth";

export default async function Layout({ children, params }: { children: React.ReactNode, params: { id: string } }) {
    const draftId = params.id;
    const draft = await fetchDraft(draftId);
    if (!draft) {
      return notFound();
    }    
    return (
        <div>
        <main className="mb-4">
        <div className="mb-4 ml-4">
          <Link
            href="/draft"
            className="mb-8 mt-4 rounded-md bg-white px-4 py-2 text-sm text-black transition-colors hover:bg-red-800 hover:text-white border-white border"
          >
            All drafts
          </Link>
        </div>
        <DraftInfoHeader draft={draft}/>
        {children}
        </main>
        </div>
    );
  }