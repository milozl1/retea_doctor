import { requireAuth } from "@/lib/auth";
import { MessagesClient } from "./messages-client";

interface Props {
  searchParams: { new?: string };
}

export default async function MessagesPage({ searchParams }: Props) {
  await requireAuth();

  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <h1 className="text-xl font-bold text-white mb-1">
          💬 Mesaje
        </h1>
        <p className="text-slate-400 text-sm">
          Conversații private cu alți profesioniști din rețea.
        </p>
      </div>

      <MessagesClient newRecipientId={searchParams.new} />
    </div>
  );
}
