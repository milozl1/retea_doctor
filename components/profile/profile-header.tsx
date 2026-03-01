import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatNumber } from "@/lib/utils";
import { Award, FileText, MessageSquare, TrendingUp, Calendar } from "lucide-react";
interface ProfileHeaderProps {
  user: {
    userId: string;
    userName: string;
    userImageSrc: string;
    bio: string | null;
    specialization: string | null;
    experienceLevel: string;
    karma: number;
    role: string;
    isVerified: boolean;
    joinedAt: Date | string;
    postCount: number;
    commentCount: number;
  };
  isOwnProfile?: boolean;
}

const EXPERIENCE_LABELS: Record<string, { label: string; color: string }> = {
  student: { label: "Student", color: "#FFC107" },
  rezident: { label: "Rezident", color: "#2196F3" },
  medic: { label: "Medic", color: "#4CAF50" },
};

export function ProfileHeader({ user, isOwnProfile = false }: ProfileHeaderProps) {
  const exp = EXPERIENCE_LABELS[user.experienceLevel] ?? {
    label: user.experienceLevel,
    color: "#94a3b8",
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-5">
      {/* Top row */}
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20 ring-2 ring-white/10">
          <AvatarImage src={user.userImageSrc} alt={user.userName} />
          <AvatarFallback className="bg-blue-600 text-white text-2xl font-bold">
            {user.userName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{user.userName}</h1>
            {user.isVerified && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                ✓ Verificat
              </Badge>
            )}
            {user.role === "admin" && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                Admin
              </Badge>
            )}
            {user.role === "moderator" && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Moderator
              </Badge>
            )}
          </div>

          {user.specialization && (
            <p className="text-blue-400 text-sm font-medium mt-0.5">
              {user.specialization}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full"
              style={{ backgroundColor: exp.color + "20", color: exp.color }}
            >
              <Award className="h-3 w-3" />
              {exp.label}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Membru din {formatDate(user.joinedAt)}
            </span>
          </div>
        </div>

        {/* Karma */}
        <div className="text-right flex-shrink-0">
          <div className="text-3xl font-bold text-orange-400">
            {formatNumber(user.karma)}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1 justify-end mt-0.5">
            <TrendingUp className="h-3 w-3" />
            karma
          </div>
          {isOwnProfile && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-slate-500 hover:text-white mt-2"
              asChild
            >
              <Link href="/settings">Editează profil</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <p className="text-slate-400 text-sm leading-relaxed border-t border-white/10 pt-4">
          {user.bio}
        </p>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
        <div className="text-center">
          <div className="text-xl font-bold text-white">
            {formatNumber(user.postCount)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
            <FileText className="h-3 w-3" />
            Postări
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-white">
            {formatNumber(user.commentCount)}
          </div>
          <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mt-0.5">
            <MessageSquare className="h-3 w-3" />
            Comentarii
          </div>
        </div>
      </div>
    </div>
  );
}
