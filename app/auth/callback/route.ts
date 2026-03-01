import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

/**
 * Auth callback for:
 *  - OAuth (Google) redirects
 *  - Email confirmation links
 *
 * Supabase redirects here with a one-time `code` parameter. We exchange it
 * for a session, sync the user into network_users, then redirect to the
 * original destination.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") ?? "/";
  // Only allow relative paths to prevent open-redirect attacks
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/";

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Sync the newly-authenticated user into the retea_doctor DB
      try {
        await fetch(`${origin}/api/auth/sync`, { method: "POST" });
      } catch {
        // Non-fatal
      }
      return NextResponse.redirect(`${origin}${safeRedirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`);
}
