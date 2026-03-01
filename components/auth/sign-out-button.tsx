"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success("Deconectat cu succes");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-300 focus:bg-red-400/10"
    >
      <LogOut className="h-4 w-4" />
      Deconectare
    </DropdownMenuItem>
  );
}
