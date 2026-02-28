import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase-server";

export interface User {
  id: string;
  email: string | null;
  firstName: string;
  imageUrl: string;
}

export async function auth(): Promise<{ userId: string | null }> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { userId: user?.id ?? null };
}

export async function authWithUser(): Promise<{
  userId: string | null;
  user: User | null;
}> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, user: null };
  }

  const userData: User = {
    id: user.id,
    email: user.email ?? null,
    firstName:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "Utilizator",
    imageUrl:
      user.user_metadata?.avatar_url ??
      user.user_metadata?.picture ??
      "/default-avatar.png",
  };

  return { userId: user.id, user: userData };
}

export async function currentUser(): Promise<User | null> {
  const { user } = await authWithUser();
  return user;
}

export async function requireAuth(): Promise<{
  userId: string;
  user: User;
}> {
  const { userId, user } = await authWithUser();

  if (!userId || !user) {
    redirect("/auth/login");
  }

  return { userId, user };
}
