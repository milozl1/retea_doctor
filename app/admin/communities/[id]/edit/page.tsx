import { db } from "@/db/drizzle";
import { communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CommunityForm } from "@/components/admin/community-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: { id: string };
}

export default async function AdminEditCommunityPage({ params }: Props) {
  const communityId = parseInt(params.id);
  if (isNaN(communityId)) notFound();

  const [community] = await db
    .select()
    .from(communities)
    .where(eq(communities.id, communityId))
    .limit(1);

  if (!community) notFound();

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/communities"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-white">
            Editează: {community.name}
          </h1>
        </div>
        <div className="glass-card p-6">
          <CommunityForm
            mode="edit"
            initialData={{
              id: community.id,
              name: community.name,
              description: community.description,
              rules: community.rules,
              color: community.color,
              iconSrc: community.iconSrc,
            }}
          />
        </div>
      </div>
    </div>
  );
}
