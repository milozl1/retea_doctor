import { notFound } from "next/navigation";
import { getPostById, getCommentsForPost, getUserVoteOnPost, isPostBookmarked } from "@/db/queries";
import { auth } from "@/lib/auth";
import { PostDetail } from "@/components/post/post-detail";
import { CommentTree } from "@/components/comments/comment-tree";
import { db } from "@/db/drizzle";
import { posts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export default async function PostPage({
  params,
}: {
  params: { id: string };
}) {
  const postId = parseInt(params.id);
  if (isNaN(postId)) {
    notFound();
  }

  const result = await getPostById(postId);
  if (!result) {
    notFound();
  }

  const { userId } = await auth();

  const [commentsData, userVote, bookmarked] = await Promise.all([
    getCommentsForPost(postId),
    userId ? getUserVoteOnPost(userId, postId) : null,
    userId ? isPostBookmarked(userId, postId) : false,
  ]);

  // Increment view count (fire-and-forget)
  db.update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.id, postId))
    .execute()
    .catch(() => {});

  return (
    <div className="space-y-4">
      <PostDetail
        post={result.post}
        author={result.author}
        community={result.community}
        userVote={userVote?.type ?? null}
        isBookmarked={bookmarked}
        isOwner={userId === result.post.userId}
      />

      {/* Comments section (includes form + tree) */}
      <div className="glass p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          {result.post.commentCount}{" "}
          {result.post.commentCount === 1 ? "comentariu" : "comentarii"}
        </h3>

        <CommentTree
          comments={commentsData}
          postId={postId}
          postAuthorId={result.post.userId}
          currentUserId={userId}
          isLocked={result.post.isLocked}
        />
      </div>
    </div>
  );
}
