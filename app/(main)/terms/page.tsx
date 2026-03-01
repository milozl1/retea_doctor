import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export const metadata = {
  title: "Termeni și Condiții | Rețea Medicală",
};

export default function TermsPage() {
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
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Termeni și Condiții
            </h1>
            <p className="text-xs text-slate-500">
              Ultima actualizare: 1 Martie 2026
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-400 prose-li:text-slate-400 prose-strong:text-slate-200">
        <h2>1. Acceptarea Termenilor</h2>
        <p>
          Prin accesarea și utilizarea platformei Rețea Medicală („Platforma"),
          parte a ecosistemului MedLearn, acceptați în mod implicit acești
          Termeni și Condiții. Dacă nu sunteți de acord cu vreunul dintre termeni,
          vă rugăm să nu utilizați Platforma.
        </p>

        <h2>2. Descrierea Serviciului</h2>
        <p>
          Rețea Medicală este o platformă de socializare profesională destinată
          exclusiv profesioniștilor din domeniul medical și studenților la
          medicină. Platforma permite:
        </p>
        <ul>
          <li>Publicarea și discutarea de conținut medical profesional</li>
          <li>Participarea la comunități tematice pe specializări medicale</li>
          <li>Comunicare privată între profesioniști (mesagerie)</li>
          <li>Urmărirea activității altor profesioniști</li>
          <li>Accesarea unui sistem de reputație (karma) bazat pe contribuții</li>
        </ul>

        <h2>3. Eligibilitate</h2>
        <p>
          Platforma este destinată profesioniștilor din domeniul medical,
          studenților la facultăți de medicină și altor persoane cu interes
          legitim în domeniul sănătății. Utilizatorii trebuie să fie majori (18+ ani).
        </p>

        <h2>4. Contul de Utilizator</h2>
        <p>
          Autentificarea se realizează prin sistemul partajat MedLearn. Sunteți
          responsabili pentru securitatea contului și activitatea desfășurată
          prin intermediul acestuia.
        </p>

        <h2>5. Conținut și Conduită</h2>
        <p>Utilizatorii se obligă să:</p>
        <ul>
          <li>Nu publice informații medicale false sau înșelătoare</li>
          <li>
            Anonimizeze toate datele pacienților conform legislației GDPR și a
            normelor etice medicale
          </li>
          <li>
            Respecte confidențialitatea și secretul profesional medical
          </li>
          <li>Nu hărțuiască sau intimideze alți utilizatori</li>
          <li>Nu publice spam sau conținut irelevant</li>
          <li>Nu încerce să compromită funcționarea platformei</li>
        </ul>

        <h2>6. Proprietate Intelectuală</h2>
        <p>
          Conținutul publicat de utilizatori rămâne proprietatea intelectuală a
          autorilor. Prin publicarea pe Platformă, utilizatorii acordă o licență
          neexclusivă de afișare și distribuire în cadrul acesteia.
        </p>

        <h2>7. Moderare</h2>
        <p>
          Echipa de administrare își rezervă dreptul de a modera, edita sau
          șterge conținut care încalcă acești termeni, fără notificare prealabilă.
          Conturile care încalcă repetat termenii pot fi suspendate sau șterse.
        </p>

        <h2>8. Disclaimer Medical</h2>
        <p>
          <strong>
            Conținutul publicat pe Platformă nu constituie consult medical și nu
            poate înlocui sfatul unui specialist.
          </strong>{" "}
          Platforma este destinată schimbului de experiență profesională între
          practicieni și nu pentru diagnosticarea sau tratarea pacienților.
        </p>

        <h2>9. Limitarea Răspunderii</h2>
        <p>
          Platforma este oferită „ca atare" (as-is). Nu garantăm disponibilitatea
          neîntreruptă sau exactitatea conținutului publicat de utilizatori. Nu
          suntem responsabili pentru deciziile luate pe baza informațiilor
          publicate pe Platformă.
        </p>

        <h2>10. Modificarea Termenilor</h2>
        <p>
          Ne rezervăm dreptul de a modifica acești termeni în orice moment.
          Utilizatorii vor fi notificați despre modificări semnificative.
          Utilizarea continuă a Platformei constituie acceptarea modificărilor.
        </p>

        <h2>11. Contact</h2>
        <p>
          Pentru întrebări legate de acești termeni, ne puteți contacta la
          pagina de{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
