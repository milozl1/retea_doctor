import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db/drizzle";
import { communities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CommunityRules } from "@/components/community/community-rules";
import { Users, FileText, Calendar, ArrowLeft } from "lucide-react";
import { formatDate, formatNumber } from "@/lib/utils";
import { defaultCommunities } from "@/config/communities";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCommunity(slug: string) {
  try {
    const [community] = await db
      .select()
      .from(communities)
      .where(eq(communities.slug, slug))
      .limit(1);
    return community;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return { title: `Despre c/${slug} — MedRețea` };
}

export default async function CommunityAboutPage({ params }: PageProps) {
  const { slug } = await params;
  const community = await getCommunity(slug);
  if (!community) notFound();

  const config = defaultCommunities.find((c) => c.slug === community.slug);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link href={`/c/${community.slug}`}>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la c/{community.name}
        </Button>
      </Link>

      {/* Header */}
      <div
        className="rounded-xl p-6 border border-white/10 space-y-4"
        style={{
          background: `linear-gradient(135deg, ${community.color}20 0%, rgba(255,255,255,0.03) 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-4xl">{config?.icon ?? "🏥"}</span>
          <div>
            <h1 className="text-2xl font-bold text-white">c/{community.name}</h1>
            <p className="text-slate-400">{community.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {formatNumber(community.memberCount)}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Users className="h-3 w-3" />
              Membri
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">
              {formatNumber(community.postCount)}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <FileText className="h-3 w-3" />
              Postări
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-slate-300">
              {formatDate(community.createdAt)}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Calendar className="h-3 w-3" />
              Creată
            </div>
          </div>
        </div>
      </div>

      {/* Rules */}
      {community.rules && (
        <CommunityRules
          rules={community.rules}
          communityName={community.name}
        />
      )}

      {/* Info */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-white mb-2">Informații</h3>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: community.color }}
          />
          <span className="text-sm text-slate-400">
            Culoare comunitate: {community.color}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-2">
          ID comunitate: #{community.id}
        </p>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <Link href={`/c/${community.slug}`} className="flex-1">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Mergi la c/{community.name}
          </Button>
        </Link>
        <Link href={`/post/new?communityId=${community.id}`}>
          <Button
            variant="outline"
            className="border-white/10 text-slate-300 hover:text-white"
          >
            + Postează
          </Button>
        </Link>
      </div>
    </div>
  );
}
