import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#040711] flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-8xl font-bold gradient-text">404</div>
        <h1 className="text-2xl font-bold text-white">
          Pagina nu a fost găsită
        </h1>
        <p className="text-slate-400">
          Ne pare rău, pagina pe care o cauți nu există sau a fost mutată.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            Pagina principală
          </Link>
          <Link
            href="/c"
            className="px-6 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white font-medium text-sm hover:bg-white/[0.1] transition-all"
          >
            Comunități
          </Link>
        </div>
      </div>
    </div>
  );
}
