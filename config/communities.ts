export interface CommunityConfig {
  slug: string;
  name: string;
  description: string;
  rules: string;
  color: string;
  isDefault: boolean;
  icon: string;
}

export const defaultCommunities: CommunityConfig[] = [
  {
    slug: "general",
    name: "General",
    description: "Discuții generale despre medicină și sănătate",
    rules:
      "1. Fii respectuos\n2. Nu distribui informații medicale false\n3. Respectă confidențialitatea pacienților",
    color: "#2196F3",
    isDefault: true,
    icon: "🏥",
  },
  {
    slug: "cardiologie",
    name: "Cardiologie",
    description: "Discuții despre bolile cardiovasculare, tratamente și cercetare",
    rules:
      "1. Discuții bazate pe evidențe\n2. Citează sursele medicale\n3. Respectă ghidurile ESC",
    color: "#F44336",
    isDefault: true,
    icon: "❤️",
  },
  {
    slug: "neurologie",
    name: "Neurologie",
    description: "Neurologie clinică, neuroscience și boli neurologice",
    rules: "1. Bine documentate cazurile\n2. Respectă confidențialitatea\n3. Nu face diagnostic online",
    color: "#9C27B0",
    isDefault: true,
    icon: "🧠",
  },
  {
    slug: "gastroenterologie",
    name: "Gastroenterologie",
    description: "Boli digestive, hepatologie și endoscopie",
    rules: "1. Cazuri anonimizate\n2. Surse verificate\n3. Discuții profesionale",
    color: "#FF9800",
    isDefault: false,
    icon: "🫀",
  },
  {
    slug: "pneumologie",
    name: "Pneumologie",
    description: "Boli respiratorii, BPOC, astm și pneumonii",
    rules: "1. Respectă ghidurile GOLD\n2. Cazuri documentate\n3. No spam",
    color: "#03A9F4",
    isDefault: true,
    icon: "🫁",
  },
  {
    slug: "medicina-interna",
    name: "Medicină Internă",
    description: "Medicina internă, diagnostic diferențial și cazuri complexe",
    rules: "1. Cazuri educative\n2. Discuții colegiale\n3. Respect reciproc",
    color: "#4CAF50",
    isDefault: true,
    icon: "📚",
  },
  {
    slug: "chirurgie",
    name: "Chirurgie",
    description: "Chirurgie generală, laparoscopică și tehnici operatorii",
    rules: "1. Fără imagini fără avertizare\n2. Discuții tehnice\n3. Respect pentru pacienți",
    color: "#607D8B",
    isDefault: false,
    icon: "🔬",
  },
  {
    slug: "pediatrie",
    name: "Pediatrie",
    description: "Medicina copilului, neonatologie și boli pediatrice",
    rules: "1. Protejează identitatea copiilor\n2. Ghiduri pediatrice\n3. Discuții empatice",
    color: "#E91E63",
    isDefault: false,
    icon: "👶",
  },
  {
    slug: "endocrinologie",
    name: "Endocrinologie",
    description: "Diabet, boli tiroidiene și tulburări endocrine",
    rules: "1. Urmează ghidurile ADA/ESE\n2. Cazuri documentate\n3. No pseudoscience",
    color: "#8BC34A",
    isDefault: false,
    icon: "⚗️",
  },
  {
    slug: "infectioase",
    name: "Boli Infecțioase",
    description: "Infecții, antibioterapie și epidemiologie",
    rules: "1. Antibiograme obligatorii\n2. Stewardship antibiotic\n3. Surse CDC/ECDC",
    color: "#FF5722",
    isDefault: false,
    icon: "🦠",
  },
  {
    slug: "rezidentiat",
    name: "Rezidențiat",
    description: "Pregătire pentru rezidențiat, sfaturi și experiențe",
    rules: "1. Sfaturi constructive\n2. No negativism\n3. Ajutor reciproc",
    color: "#FFC107",
    isDefault: true,
    icon: "📖",
  },
  {
    slug: "cazuri-clinice",
    name: "Cazuri Clinice",
    description: "Prezentare și discuție de cazuri clinice interesante",
    rules: "1. Anonimizare obligatorie\n2. Format structurat\n3. Discuție educativă",
    color: "#00BCD4",
    isDefault: true,
    icon: "🩺",
  },
  {
    slug: "off-topic",
    name: "Off-Topic",
    description: "Discuții non-medicale, viața medicilor, burnout",
    rules: "1. Respect reciproc\n2. No politics\n3. Comunitate safe",
    color: "#795548",
    isDefault: false,
    icon: "☕",
  },
  {
    slug: "feedback-medlearn",
    name: "Feedback MedLearn",
    description: "Sugestii și feedback pentru platforma MedLearn",
    rules: "1. Feedback constructiv\n2. Bug reports detaliate\n3. Sugestii specifice",
    color: "#4F46E5",
    isDefault: false,
    icon: "💬",
  },
];
