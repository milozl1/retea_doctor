import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getCommunities } from "@/db/queries";
import { PostForm } from "@/components/post/post-form";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: { community?: string };
}) {
  await requireAuth();

  const communities = await getCommunities();

  const defaultCommunity = searchParams.community
    ? communities.find((c) => c.slug === searchParams.community)
    : undefined;

  return (
    <div className="space-y-4">
      <div className="glass p-6">
        <h1 className="text-xl font-bold text-white mb-1">
          ✏️ Postare nouă
        </h1>
        <p className="text-gray-400 text-sm">
          Creează o discuție, prezintă un caz clinic sau pune o întrebare.
        </p>
      </div>

      <div className="glass p-6">
        <PostForm
          communities={communities}
          defaultCommunityId={defaultCommunity?.id}
        />
      </div>
    </div>
  );
}
