import { createClient } from "./supabase-server";
import { redirect } from "next/navigation";

export interface User {
  id: string;
  email: string | null;
  firstName: string;
  imageUrl: string;
}

export async function auth(): Promise<{ userId: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { userId: user?.id ?? null };
}

export async function authWithUser(): Promise<{
  userId: string | null;
  user: User | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, user: null };
  }

  const mappedUser: User = {
    id: user.id,
    email: user.email ?? null,
    firstName:
      user.user_metadata?.first_name ??
      user.user_metadata?.name ??
      user.email?.split("@")[0] ??
      "Utilizator",
    imageUrl: user.user_metadata?.avatar_url ?? "",
  };

  return { userId: user.id, user: mappedUser };
}

export async function currentUser(): Promise<User | null> {
  const { user } = await authWithUser();
  return user;
}

export async function requireAuth(): Promise<User> {
  const { user } = await authWithUser();
  if (!user) {
    redirect("/auth/login");
  }
  return user;
}
