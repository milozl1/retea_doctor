"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#040711] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-emergency/10 flex items-center justify-center">
          <span className="text-4xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white">
          Ceva nu a funcționat
        </h1>
        <p className="text-slate-400">
          A apărut o eroare neașteptată. Te rugăm să încerci din nou.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            Încearcă din nou
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.1] transition-all"
          >
            Pagina principală
          </Link>
        </div>
      </div>
    </div>
  );
}
