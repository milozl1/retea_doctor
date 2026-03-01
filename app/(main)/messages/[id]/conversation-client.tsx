"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { toast } from "sonner";

interface Message {
  id: number;
  content: string;
  senderId: string;
  isDeleted: boolean;
  createdAt: string;
  senderName: string;
  senderImage: string;
}

interface OtherUser {
  userId: string;
  userName: string;
  userImageSrc: string;
  specialization: string | null;
  isVerified: boolean;
}

interface ConversationClientProps {
  conversationId: number;
  currentUserId: string;
  otherUser: OtherUser | null;
}

export function ConversationClient({
  conversationId,
  currentUserId,
  otherUser,
}: ConversationClientProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data, mutate, isLoading } = useSWR<{ messages: Message[] }>(
    `/api/messages/${conversationId}`,
    { refreshInterval: 5000 }
  );

  const msgs = data?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const sendMessage = async () => {
    if (!content.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Eroare la trimitere");
      }

      setContent("");
      mutate();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Eroare la trimitere"
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="glass-card p-4 flex items-center gap-3 shrink-0">
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        {otherUser && (
          <Link href={`/u/${otherUser.userId}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <Avatar className="h-8 w-8">
              <AvatarImage src={otherUser.userImageSrc} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs">
                {otherUser.userName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-sm font-medium text-white">
                {otherUser.userName}
                {otherUser.isVerified && <span className="text-primary ml-1">✓</span>}
              </span>
              {otherUser.specialization && (
                <p className="text-[10px] text-slate-500">{otherUser.specialization}</p>
              )}
            </div>
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4 space-y-3 px-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
          </div>
        ) : msgs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-slate-500 text-sm">Niciun mesaj încă.</p>
            <p className="text-slate-600 text-xs mt-1">Trimite un mesaj pentru a începe conversația.</p>
          </div>
        ) : (
          msgs.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2 max-w-[80%]",
                  isMe ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {!isMe && (
                  <Avatar className="h-7 w-7 shrink-0 mt-1">
                    <AvatarImage src={msg.senderImage} />
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                      {msg.senderName[0]}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed",
                    isMe
                      ? "bg-primary/20 text-white rounded-br-md"
                      : "glass-sm text-slate-200 rounded-bl-md"
                  )}
                >
                  {msg.isDeleted ? (
                    <span className="italic text-slate-600">[mesaj șters]</span>
                  ) : (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                  <p className={cn(
                    "text-[10px] mt-1",
                    isMe ? "text-primary/50 text-right" : "text-slate-600"
                  )}>
                    {timeAgo(msg.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="glass-card p-3 shrink-0">
        <div className="flex items-end gap-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Scrie un mesaj..."
            className="bg-white/[0.04] border-white/[0.06] text-white placeholder:text-slate-600 min-h-[44px] max-h-32 resize-none rounded-xl"
            rows={1}
          />
          <Button
            onClick={sendMessage}
            disabled={!content.trim() || isSending}
            size="icon"
            className="h-[44px] w-[44px] rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shrink-0"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
