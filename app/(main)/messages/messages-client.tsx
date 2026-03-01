"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Search, Loader2 } from "lucide-react";
import { timeAgo, truncate, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Conversation {
  id: number;
  otherUser: {
    userId: string;
    userName: string;
    userImageSrc: string;
    specialization: string | null;
    isVerified: boolean;
  } | null;
  lastMessage: {
    id: number;
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
}

interface MessagesClientProps {
  newRecipientId?: string;
}

export function MessagesClient({ newRecipientId }: MessagesClientProps) {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(!!newRecipientId);
  const { data, isLoading } = useSWR<{ conversations: Conversation[] }>(
    "/api/messages",
    { refreshInterval: 15000 }
  );
  const [search, setSearch] = useState("");

  // Auto-create or find conversation when newRecipientId is set
  useEffect(() => {
    if (!newRecipientId) return;

    async function createOrFindConversation() {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: newRecipientId }),
        });
        if (res.ok) {
          const { conversationId } = await res.json();
          router.replace(`/messages/${conversationId}`);
        } else {
          setRedirecting(false);
        }
      } catch {
        setRedirecting(false);
      }
    }

    createOrFindConversation();
  }, [newRecipientId, router]);

  if (redirecting) {
    return (
      <div className="glass-card p-12 text-center">
        <Loader2 className="h-8 w-8 text-primary mx-auto mb-3 animate-spin" />
        <p className="text-slate-400">Se deschide conversația...</p>
      </div>
    );
  }

  const conversations = data?.conversations ?? [];
  const filtered = search
    ? conversations.filter((c) =>
        c.otherUser?.userName.toLowerCase().includes(search.toLowerCase())
      )
    : conversations;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-4 animate-shimmer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/[0.04]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/[0.04] rounded w-1/3" />
                <div className="h-3 bg-white/[0.03] rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Caută conversații..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-white/[0.04] border-white/[0.06] text-white placeholder:text-slate-600"
        />
      </div>

      {/* Conversation List */}
      {filtered.length > 0 ? (
        <div className="space-y-1">
          {filtered.map((conv) => (
            <Link
              key={conv.id}
              href={`/messages/${conv.id}`}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                conv.unreadCount > 0
                  ? "bg-primary/[0.06] border border-primary/10 hover:bg-primary/[0.1]"
                  : "glass-sm glass-hover"
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={conv.otherUser?.userImageSrc} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {conv.otherUser?.userName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {conv.otherUser?.userName}
                    {conv.otherUser?.isVerified && (
                      <span className="text-primary ml-1">✓</span>
                    )}
                  </span>
                  {conv.lastMessage && (
                    <span className="text-[10px] text-slate-600">
                      {timeAgo(conv.lastMessage.createdAt)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 truncate">
                    {conv.lastMessage
                      ? truncate(conv.lastMessage.content, 60)
                      : "Niciun mesaj încă"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="flex items-center justify-center h-5 min-w-[20px] rounded-full bg-primary text-white text-[10px] font-bold px-1">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <MessageSquare className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            {search ? "Nicio conversație găsită." : "Nicio conversație încă."}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Trimite un mesaj vizitând profilul unui utilizator.
          </p>
        </div>
      )}
    </div>
  );
}
