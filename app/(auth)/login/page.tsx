import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Autentificare — MedRețea",
};

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) redirect("/");

  const medlearnUrl = process.env.NEXT_PUBLIC_MEDLEARN_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-6xl">🏥</span>
          <h1 className="text-3xl font-bold text-white mt-4">MedRețea</h1>
          <p className="text-slate-400 mt-2">Rețeaua de socializare a medicilor</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-white">Autentificare</h2>
          <p className="text-slate-400 text-sm">
            MedRețea folosește același cont ca platforma MedLearn. Autentifică-te
            prin MedLearn pentru a accesa rețeaua.
          </p>

          <a
            href={`${medlearnUrl}/sign-in`}
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl text-center transition-colors"
          >
            Autentifică-te cu MedLearn
          </a>

          <p className="text-center text-slate-500 text-xs">
            Nu ai cont?{" "}
            <a
              href={`${medlearnUrl}/sign-up`}
              className="text-blue-400 hover:underline"
            >
              Înregistrează-te pe MedLearn
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
