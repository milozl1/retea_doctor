import Link from "next/link";
import { ArrowLeft, Heart, Users, BookOpen, Code, Shield } from "lucide-react";

export const metadata = {
  title: "Despre Noi | Rețea Medicală",
};

export default function AboutPage() {
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
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Despre Rețea Medicală</h1>
            <p className="text-xs text-slate-500">Echipa și misiunea noastră</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-slate-400 prose-li:text-slate-400">
        <h2>Misiunea Noastră</h2>
        <p>
          Rețea Medicală este o platformă comunitară dedicată profesioniștilor
          din domeniul sănătății. Credem că schimbul de cunoștințe și experiențe
          între medici, rezidenți și studenți duce la îmbunătățirea actului
          medical și, implicit, a vieții pacienților.
        </p>

        <h2>Ce Oferim</h2>
        <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
          {[
            {
              icon: Users,
              title: "Comunitate Profesională",
              desc: "Conectează-te cu colegi din toate specializările",
              color: "text-blue-400",
              bg: "bg-blue-400/10",
            },
            {
              icon: BookOpen,
              title: "Cazuri Clinice",
              desc: "Discută cazuri reale, anonimizate, cu colegii",
              color: "text-emerald-400",
              bg: "bg-emerald-400/10",
            },
            {
              icon: Code,
              title: "Parte din MedLearn",
              desc: "Integrat cu platforma educațională MedLearn",
              color: "text-purple-400",
              bg: "bg-purple-400/10",
            },
            {
              icon: Shield,
              title: "Confidențialitate",
              desc: "Date protejate conform GDPR și norme etice",
              color: "text-amber-400",
              bg: "bg-amber-400/10",
            },
          ].map((item) => (
            <div key={item.title} className="glass-sm p-4">
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mb-2`}>
                <item.icon className={`h-4 w-4 ${item.color}`} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>

        <h2>Valorile Noastre</h2>
        <ul>
          <li>
            <strong className="text-slate-200">Acuratețe</strong> — Promovăm
            informațiile bazate pe dovezi științifice
          </li>
          <li>
            <strong className="text-slate-200">Respect</strong> — Discuții
            constructive cu respect reciproc
          </li>
          <li>
            <strong className="text-slate-200">Confidențialitate</strong> —
            Protecția datelor pacienților și colegilor
          </li>
          <li>
            <strong className="text-slate-200">Colaborare</strong> — Îmbunătățirea
            actului medical prin schimb de experiență
          </li>
        </ul>

        <h2>Ecosistemul MedLearn</h2>
        <p>
          Rețea Medicală este parte integrantă a ecosistemului MedLearn,
          platformă educațională pentru profesioniști din domeniul medical.
          Împreună, oferim o experiență completă de învățare și networking.
        </p>

        <h2>Contact</h2>
        <p>
          Întrebări, sugestii sau feedback? Vizitează pagina de{" "}
          <Link href="/contact" className="text-primary hover:underline">
            Contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
