import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: "Înregistrare — MedRețea",
};

interface PageProps {
  searchParams: Promise<{ redirectTo?: string }>;
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const { userId } = await auth();
  const { redirectTo } = await searchParams;
  if (userId) redirect(redirectTo ?? "/");

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">🏥</span>
          <h1 className="text-3xl font-bold text-white mt-4">MedRețea</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Înregistrare unică — valabilă și pe MedLearn
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Cont nou</h2>
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
