import Link from "next/link";
import { ArrowLeft, Cookie } from "lucide-react";

export const metadata = {
  title: "Politica Cookies | Rețea Medicală",
};

export default function CookiesPage() {
  return (
    <div className="space-y-4">
      <div className="glass-card p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Cookie className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Politica Cookies</h1>
            <p className="text-xs text-slate-500">
              Ultima actualizare: 1 Martie 2026
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-400 prose-li:text-slate-400 prose-strong:text-slate-200">
        <h2>Ce sunt Cookie-urile?</h2>
        <p>
          Cookie-urile sunt fișiere text mici stocate pe dispozitivul
          dumneavoastră atunci când vizitați un site web. Acestea ajută la
          funcționarea corectă a platformei.
        </p>

        <h2>Cookie-uri Utilizate</h2>

        <h3>Cookie-uri Esențiale (obligatorii)</h3>
        <p>
          Acestea sunt necesare pentru funcționarea platformei și nu pot fi
          dezactivate.
        </p>
        <div className="not-prose">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-slate-300 font-medium">Cookie</th>
                <th className="text-left py-2 text-slate-300 font-medium">Scop</th>
                <th className="text-left py-2 text-slate-300 font-medium">Durată</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-white/5">
                <td className="py-2 font-mono text-xs">sb-*-auth-token</td>
                <td className="py-2">Autentificare utilizator</td>
                <td className="py-2">Sesiune / 7 zile</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="py-2 font-mono text-xs">theme</td>
                <td className="py-2">Preferință temă (dark/light)</td>
                <td className="py-2">1 an</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3>Cookie-uri Funcționale</h3>
        <p>
          Îmbunătățesc experiența utilizatorului, dar pot fi dezactivate.
        </p>
        <div className="not-prose">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-slate-300 font-medium">Cookie</th>
                <th className="text-left py-2 text-slate-300 font-medium">Scop</th>
                <th className="text-left py-2 text-slate-300 font-medium">Durată</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-white/5">
                <td className="py-2 font-mono text-xs">feed_sort</td>
                <td className="py-2">Preferință sortare feed</td>
                <td className="py-2">30 zile</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Cookie-uri Terțe</h2>
        <p>
          Nu utilizăm cookie-uri de tracking publicitar. Nu partajăm datele de
          navigare cu terți.
        </p>

        <h2>Gestionarea Cookie-urilor</h2>
        <p>
          Puteți gestiona cookie-urile din setările browserului dumneavoastră.
          Dezactivarea cookie-urilor esențiale poate afecta funcționarea
          platformei.
        </p>

        <h2>Contact</h2>
        <p>
          Pentru întrebări privind cookie-urile, vizitați pagina de{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
