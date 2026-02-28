import { searchPosts } from "@/db/queries";
import { SearchBar } from "@/components/search/search-bar";
import Link from "next/link";
import { PostTypeBadge } from "@/components/post/post-type-badge";
import { MessageSquare, ArrowBigUp, Clock, SearchX } from "lucide-react";
import { timeAgo, formatNumber } from "@/lib/utils";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const results = query ? await searchPosts(query, 30) : [];

  return (
    <div className="space-y-4">
      <div className="glass p-6">
        <h1 className="text-xl font-bold text-white mb-3">
          🔍 Caută
        </h1>
        <SearchBar />
      </div>

      {query && (
        <p className="text-sm text-gray-400 px-1">
          {results.length} rezultat{results.length !== 1 ? "e" : ""} pentru{" "}
          <span className="text-white font-medium">&ldquo;{query}&rdquo;</span>
        </p>
      )}

      {query && results.length > 0 ? (
        <div className="space-y-3">
          {results.map(({ post, author, community }) => (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="block glass p-4 glass-hover"
            >
              <div className="flex items-center gap-2 mb-2">
                <PostTypeBadge type={post.type} />
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: community.color + "20",
                    color: community.color,
                  }}
                >
                  {community.name}
                </span>
                <span className="text-xs text-gray-500">
                  de {author.userName}
                </span>
              </div>
              <h3 className="text-sm font-medium text-white mb-1">
                {post.title}
              </h3>
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <ArrowBigUp className="h-3 w-3" />
                  {formatNumber(post.score)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {post.commentCount}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(post.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="glass p-12 text-center">
          <SearchX className="h-12 w-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">
            Niciun rezultat pentru &ldquo;{query}&rdquo;
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Încearcă cu alți termeni de căutare.
          </p>
        </div>
      ) : null}
    </div>
  );
}
