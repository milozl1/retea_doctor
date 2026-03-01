import { redirect } from "next/navigation";

export default function LoginPage() {
  // Since we use Supabase Auth shared with the Doctor app,
  // redirect to the main Doctor app's login
  redirect(process.env.NEXT_PUBLIC_MEDLEARN_URL ? `${process.env.NEXT_PUBLIC_MEDLEARN_URL}/sign-in` : "/auth/login");
}
