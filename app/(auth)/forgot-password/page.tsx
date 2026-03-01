import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";

export const metadata = {
  title: "Resetare parolă — MedRețea",
};

export default async function ForgotPasswordPage() {
  const { userId } = await auth();
  if (userId) redirect("/");

  const medlearnUrl = process.env.NEXT_PUBLIC_MEDLEARN_URL ?? "";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">🔐</span>
          <h1 className="text-3xl font-bold text-white mt-4">Parolă uitată</h1>
          <p className="text-slate-400 mt-1 text-sm">Resetare prin MedLearn</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <p className="text-slate-400 text-sm leading-relaxed">
            Deoarece MedRețea și MedLearn folosesc <strong className="text-white">același cont</strong>,
            resetarea parolei se face prin platforma MedLearn. Odată resetată,
            noua parolă va funcționa în ambele aplicații.
          </p>

          {medlearnUrl ? (
            <a
              href={`${medlearnUrl}/forgot-password`}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl text-center transition-colors"
            >
              Resetează parola pe MedLearn
            </a>
          ) : (
            <p className="text-xs text-slate-500 text-center">
              Contactează administratorul pentru resetarea parolei.
            </p>
          )}

          <Link
            href="/auth/login"
            className="block text-center text-sm text-slate-400 hover:text-white transition-colors"
          >
            ← Înapoi la autentificare
          </Link>
        </div>
      </div>
    </div>
  );
}
