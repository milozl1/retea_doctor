"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, User, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RoleSelectorProps {
  userId: string;
  currentRole: string;
  roleColors: Record<string, string>;
}

const ROLES = [
  { value: "user", label: "User", icon: User },
  { value: "moderator", label: "Moderator", icon: Star },
  { value: "admin", label: "Admin", icon: Shield },
];

export function RoleSelector({ userId, currentRole, roleColors }: RoleSelectorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const currentRoleData = ROLES.find((r) => r.value === currentRole) || ROLES[0];
  const RoleIcon = currentRoleData.icon;

  async function handleRoleChange(newRole: string) {
    if (newRole === currentRole) {
      setOpen(false);
      return;
    }
    setLoading(true);
    setOpen(false);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Eroare");
      }
      toast.success(`Rol schimbat în ${newRole}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Eroare la schimbarea rolului");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1"
      >
        <Badge className={`${roleColors[currentRole] || roleColors.user} cursor-pointer`}>
          {loading ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <RoleIcon className="h-3 w-3 mr-1" />
          )}
          {currentRole}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Badge>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-50 bg-[#0a0f1c] border border-white/10 rounded-lg shadow-2xl overflow-hidden min-w-[140px]">
            {ROLES.map((role) => (
              <button
                key={role.value}
                onClick={() => handleRoleChange(role.value)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
                  role.value === currentRole ? "text-white bg-white/5" : "text-slate-400"
                }`}
              >
                <role.icon className="h-3 w-3" />
                {role.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
