import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata = {
  title: "Autentificare — MedRețea",
};

interface PageProps {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  const { redirectTo, error } = await searchParams;
  if (userId) redirect(redirectTo ?? "/");

  const medlearnUrl = process.env.NEXT_PUBLIC_MEDLEARN_URL ?? "";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">🏥</span>
          <h1 className="text-3xl font-bold text-white mt-4">MedRețea</h1>
          <p className="text-slate-400 mt-1 text-sm">Rețeaua de socializare a medicilor</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Autentificare</h2>

          {error === "auth_callback_failed" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm">
              Autentificarea a eșuat. Încearcă din nou.
            </div>
          )}

          <LoginForm />
        </div>

        {medlearnUrl && (
          <p className="text-center text-xs text-slate-600 mt-4">
            Același cont funcționează și pe{" "}
            <a
              href={medlearnUrl}
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              platforma MedLearn
            </a>
            .{" "}
            <Link href="/auth/sign-up" className="text-blue-500 hover:underline">
              Înregistrare unică pentru ambele.
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
