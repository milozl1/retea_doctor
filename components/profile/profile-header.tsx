import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatNumber, EXPERIENCE_LABELS } from "@/lib/utils";
import {
  Calendar,
  Award,
  MessageSquare,
  FileText,
  Star,
  Users,
} from "lucide-react";

interface ProfileHeaderProps {
  user: {
    userId: string;
    userName: string;
    userImageSrc: string;
    bio: string | null;
    specialization: string | null;
    experienceLevel: string;
    karma: number;
    isVerified: boolean;
    joinedAt: string | Date;
    postCount: number;
    commentCount: number;
  };
  followersCount?: number;
  followingCount?: number;
}

export function ProfileHeader({ user, followersCount = 0, followingCount = 0 }: ProfileHeaderProps) {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.userImageSrc} />
          <AvatarFallback className="bg-primary/20 text-primary text-2xl">
            {user.userName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">{user.userName}</h1>
            {user.isVerified && (
              <Badge className="bg-primary/20 text-primary border-primary/30">
                ✓ Verificat
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-400">
            <Badge
              variant="outline"
              className="border-white/10 text-slate-300"
            >
              {EXPERIENCE_LABELS[user.experienceLevel] ||
                user.experienceLevel}
            </Badge>
            {user.specialization && (
              <span className="text-primary">
                {user.specialization}
              </span>
            )}
          </div>

          {user.bio && (
            <p className="text-sm text-slate-400">{user.bio}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        <div className="glass-card p-3 text-center">
          <Star className="h-4 w-4 text-warning mx-auto mb-1" />
          <p className="text-lg font-bold text-white">
            {formatNumber(user.karma)}
          </p>
          <p className="text-[10px] text-slate-500">Karma</p>
        </div>
        <div className="glass-card p-3 text-center">
          <FileText className="h-4 w-4 text-primary mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{user.postCount}</p>
          <p className="text-[10px] text-slate-500">Postări</p>
        </div>
        <div className="glass-card p-3 text-center">
          <MessageSquare className="h-4 w-4 text-clinical mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{user.commentCount}</p>
          <p className="text-[10px] text-slate-500">Comentarii</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Users className="h-4 w-4 text-indigo-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{formatNumber(followersCount)}</p>
          <p className="text-[10px] text-slate-500">Urmăritori</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Users className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{formatNumber(followingCount)}</p>
          <p className="text-[10px] text-slate-500">Urmăresc</p>
        </div>
        <div className="glass-card p-3 text-center">
          <Calendar className="h-4 w-4 text-slate-400 mx-auto mb-1" />
          <p className="text-xs font-medium text-white">
            {formatDate(user.joinedAt)}
          </p>
          <p className="text-[10px] text-slate-500">Membru din</p>
        </div>
      </div>
    </div>
  );
}
