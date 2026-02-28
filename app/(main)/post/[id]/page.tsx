import { notFound } from "next/navigation";
import { getPostById, getCommentsForPost, getUserVoteOnPost, isPostBookmarked } from "@/db/queries";
import { auth } from "@/lib/auth";
import { PostDetail } from "@/components/post/post-detail";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentTree } from "@/components/comments/comment-tree";

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

  return (
    <div className="space-y-4">
      <PostDetail
        post={result.post}
        author={result.author}
        community={result.community}
        userVote={userVote?.type ?? null}
      />

      {/* Comment Form */}
      {userId && !result.post.isLocked && (
        <div className="glass p-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            Adaugă un comentariu
          </h3>
          <CommentForm postId={postId} />
        </div>
      )}

      {result.post.isLocked && (
        <div className="glass p-4 text-center">
          <p className="text-gray-400 text-sm">
            🔒 Postarea este blocată. Nu se mai pot adăuga comentarii.
          </p>
        </div>
      )}

      {/* Comments */}
      <div className="glass p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">
          {result.post.commentCount}{" "}
          {result.post.commentCount === 1 ? "comentariu" : "comentarii"}
        </h3>

        {commentsData.length > 0 ? (
          <CommentTree
            comments={commentsData}
            postId={postId}
            postAuthorId={result.post.userId}
            isLocked={result.post.isLocked}
          />
        ) : (
          <p className="text-gray-500 text-sm text-center py-8">
            Niciun comentariu încă. Fii primul care comentează!
          </p>
        )}
      </div>
    </div>
  );
}
