import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Politica de Confidențialitate | Rețea Medicală",
};

export default function PrivacyPage() {
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
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Shield className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Politica de Confidențialitate
            </h1>
            <p className="text-xs text-slate-500">
              Ultima actualizare: 1 Martie 2026
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-400 prose-li:text-slate-400 prose-strong:text-slate-200">
        <h2>1. Introducere</h2>
        <p>
          Rețea Medicală, parte a ecosistemului MedLearn, respectă
          confidențialitatea datelor dumneavoastră. Această politică descrie ce
          date colectăm, cum le utilizăm și cum le protejăm, în conformitate
          cu Regulamentul General privind Protecția Datelor (GDPR).
        </p>

        <h2>2. Date Colectate</h2>
        <h3>2.1 Date furnizate direct</h3>
        <ul>
          <li>Informații de profil: nume, specializare, nivel experiență, bio</li>
          <li>Conținut publicat: postări, comentarii, mesaje private</li>
          <li>Preferințe de setare și personalizare</li>
        </ul>
        <h3>2.2 Date colectate automat</h3>
        <ul>
          <li>Jurnal de autentificare și activitate</li>
          <li>Date tehnice: browser, dispozitiv, adresă IP</li>
          <li>Cookies funcționale necesare autentificării</li>
        </ul>

        <h2>3. Scopul Prelucrării</h2>
        <p>Datele sunt utilizate pentru:</p>
        <ul>
          <li>Funcționarea și îmbunătățirea platformei</li>
          <li>Autentificarea și securitatea contului</li>
          <li>Personalizarea experienței (feed, notificări)</li>
          <li>Moderarea conținutului și prevenirea abuzurilor</li>
          <li>Statistici agregate și anonimizate</li>
        </ul>

        <h2>4. Baza Legală</h2>
        <p>
          Prelucrarea datelor se bazează pe consimțământul dumneavoastră
          (acordat la créarea contului), interesul nostru legitim de operare
          a platformei și obligațiile legale aplicabile.
        </p>

        <h2>5. Partajarea Datelor</h2>
        <p>
          Nu vindem și nu partajăm datele personale cu terți în scopuri
          comerciale. Datele pot fi partajate doar cu:
        </p>
        <ul>
          <li>
            Furnizori de infrastructură (hosting, baze de date) — sub
            acorduri stricte de confidențialitate
          </li>
          <li>Autorități — doar la cererea legală expresă</li>
        </ul>

        <h2>6. Securitatea Datelor</h2>
        <p>
          Implementăm măsuri tehnice și organizatorice pentru protecția datelor:
          criptarea comunicațiilor (TLS), hashing parole, control acces
          bazat pe roluri, backup-uri regulate și monitorizare.
        </p>

        <h2>7. Drepturile Dumneavoastră</h2>
        <p>Conform GDPR, aveți dreptul la:</p>
        <ul>
          <li>
            <strong>Acces</strong> — să solicitați o copie a datelor
          </li>
          <li>
            <strong>Rectificare</strong> — să corectați datele inexacte
          </li>
          <li>
            <strong>Ștergere</strong> — să solicitați ștergerea contului și datelor
          </li>
          <li>
            <strong>Portabilitate</strong> — să primiți datele într-un format
            structurat
          </li>
          <li>
            <strong>Opoziție</strong> — să vă opuneți prelucrării
          </li>
        </ul>
        <p>
          Pentru exercitarea drepturilor, vizitați pagina de{" "}
          <Link href="/settings" className="text-primary hover:underline">
            Setări
          </Link>{" "}
          sau{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contactați-ne
          </Link>
          .
        </p>

        <h2>8. Retenția Datelor</h2>
        <p>
          Datele sunt păstrate atât timp cât contul este activ. La ștergerea
          contului, datele personale sunt eliminate în termen de 30 de zile.
          Conținutul publicat poate fi păstrat în formă anonimizată.
        </p>

        <h2>9. Cookies</h2>
        <p>
          Utilizăm cookie-uri esențiale pentru autentificare și preferințe
          de sesiune. Nu utilizăm cookies de tracking publicitar. Detalii pe
          pagina de{" "}
          <Link href="/cookies" className="text-primary hover:underline">
            Politica Cookies
          </Link>
          .
        </p>

        <h2>10. Contact DPO</h2>
        <p>
          Pentru întrebări privind datele personale, contactați responsabilul
          cu protecția datelor la pagina de{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
