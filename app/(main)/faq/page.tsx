import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Întrebări Frecvente | Rețea Medicală",
};

const FAQ_ITEMS = [
  {
    q: "Ce este Rețea Medicală?",
    a: "Rețea Medicală este o platformă de socializare profesională destinată medicilor, rezidenților și studenților la medicină. Făcând parte din ecosistemul MedLearn, platforma oferă un spațiu de discuție, cazuri clinice, schimb de experiență și networking profesional.",
  },
  {
    q: "Cine poate crea un cont?",
    a: "Platforma este accesibilă tuturor profesioniștilor din domeniul medical și studenților la medicină. Autentificarea se face prin contul MedLearn — dacă ai deja un cont pe platforma de e-learning, poți folosi aceleași credențiale.",
  },
  {
    q: "Cum funcționează sistemul de karma?",
    a: "Karma reflectă contribuțiile tale în comunitate. Primești karma atunci când postările sau comentariile tale primesc voturi pozitive (upvotes). Cu cât ai mai mult karma, cu atât ești considerat un contribuitor mai valoros.",
  },
  {
    q: "Ce tipuri de postări pot crea?",
    a: "Poți crea următoarele tipuri de postări text: Discuție (topic liber sau întrebare), Caz Clinic (prezentare de caz cu anonimizarea datelor), Articol (sharing de cunoștințe), Întrebare Rapidă (Q&A scurt) sau Link Extern (articol sau studiu din afara platformei).",
  },
  {
    q: "Cum pot deveni moderator?",
    a: "Rolul de moderator este acordat de administratorii platformei utilizatorilor care demonstrează contribuții constante și de calitate. Dacă ești interesat, contactează-ne prin pagina de Contact.",
  },
  {
    q: "Datele pacienților sunt protejate?",
    a: "Absolut. Toate cazurile clinice TREBUIE anonimizate. Publicarea de date care pot identifica un pacient este strict interzisă și duce la sancțiuni până la ștergerea contului. Consultă regulamentele comunităților individuale pentru detalii.",
  },
  {
    q: "Pot șterge un comentariu sau o postare?",
    a: "Da, poți șterge propriile postări și comentarii din interfață. Postările șterse sunt marcate ca atare dar pot rămâne vizibile în formă anonimizată dacă au răspunsuri. Poți edita conținutul postărilor și comentariilor.",
  },
  {
    q: "Cum pot raporta conținut inadecvat?",
    a: 'Fiecare postare și comentariu are o opțiune de "Raportare" (iconul steag). Selectează motivul raportării și echipa de moderare va analiza cazul. Raportările sunt anonime.',
  },
  {
    q: "Cum funcționează mesajele private?",
    a: "Poți trimite mesaje private vizitând profilul unui utilizator și apăsând pe butonul 'Mesaj'. Conversațiile sunt private și criptate în tranzit.",
  },
  {
    q: "Pot să-mi șterg contul?",
    a: "Da, poți solicita ștergerea contului din pagina de Setări sau prin formularul de Contact. Datele personale vor fi șterse în termen de 30 de zile, conform politicii noastre de confidențialitate.",
  },
  {
    q: "Există o aplicație mobilă?",
    a: "Platforma este optimizată pentru dispozitive mobile prin design responsive. Nu există încă o aplicație nativă, dar o poți adăuga pe ecranul principal al telefonului ca PWA.",
  },
];

export default function FAQPage() {
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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Întrebări Frecvente (FAQ)
            </h1>
            <p className="text-xs text-slate-500">
              Răspunsuri la cele mai comune întrebări
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <details
            key={i}
            className="glass-card group"
          >
            <summary className="cursor-pointer p-4 flex items-center justify-between text-sm font-medium text-white hover:text-primary transition-colors list-none">
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs text-slate-500 font-mono shrink-0">
                  {i + 1}
                </span>
                {item.q}
              </span>
              <span className="text-slate-600 group-open:rotate-45 transition-transform text-lg">
                +
              </span>
            </summary>
            <div className="px-4 pb-4 pl-[52px]">
              <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="glass-card p-6 text-center">
        <p className="text-slate-400 text-sm mb-3">
          Nu ai găsit răspunsul? Contactează-ne direct.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-500 text-white text-sm font-medium shadow-lg shadow-primary/20"
        >
          Contactează-ne
        </Link>
      </div>
    </div>
  );
}
