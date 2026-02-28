# 🏥 PROMPT SUPREM — Rețea de Socializare Medicală Profesională

## Obiectiv
Creează o aplicație **Next.js 14 (App Router)** complet funcțională care servește drept **rețea de socializare profesională medicală** — un "Reddit intern" al platformei MedLearn (din repo `milozl1/Doctor`). Aplicația se conectează la o **bază de date PostgreSQL separată** dar este legată conceptual de aplicația principală Doctor/MedLearn prin userId-ul comun (Supabase Auth).

---

## 📋 CONTEXT TEHNIC — Aplicația Sursă (Doctor/MedLearn)

### Stack-ul pe care TREBUIE să-l replici identic:
- **Framework**: Next.js 14 cu App Router
- **Limbaj**: TypeScript (strict mode)
- **Database**: PostgreSQL (Supabase) + **Drizzle ORM** (NU Prisma, NU TypeORM)
- **Autentificare**: Supabase Auth (GoTrue) — funcțiile `auth()`, `authWithUser()`, `currentUser()` din `lib/auth.ts`
- **UI**: Tailwind CSS + shadcn/ui + Radix UI + Lucide React icons
- **State management**: Zustand (pentru modale/global state)
- **Toasts**: Sonner
- **Client caching**: SWR
- **Rate limiting**: Custom middleware cu sliding window
- **Validare**: Zod (pe server + client)
- **Teme**: Dark mode optimizat (next-themes), design glassmorphism

### Design System MedLearn (OBLIGATORIU):
```css
/* Culori principale */
Primary Blue:    #2196F3
Clinical Green:  #4CAF50
Emergency Red:   #F44336
Warning Yellow:  #FFC107
Indigo gradient: #4F46E5 → #06B6D4

/* Background dark mode */
--bg-primary:    #0F172A (slate-900)
--bg-secondary:  #1E293B (slate-800)
--bg-card:       white/5 cu border white/10

/* Glassmorphism cards */
background: rgba(255,255,255,0.05);
backdrop-filter: blur(12px);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 1rem;

/* Typography */
Font: System UI stack (Inter pentru headings)
```

### Schema DB Doctor (tabele relevante pentru integrare):
- `user_progress` — PK: userId (text), userName, userImageSrc, experienceLevel, points, streak
- `specializations` — id, name, description, iconSrc, color
- `courses` — id, title, specializationId
- `case_studies` — id, title, description, patientHistory, presentation, category, specializationId, difficulty
- `community_questions` — id, userId, question, status (pending/approved/rejected)

### Autentificare (CRITICĂ — copiază exact din Doctor):
```typescript
// lib/auth.ts — Pattern obligatoriu
export async function auth(): Promise<{ userId: string | null }> { ... }
export async function authWithUser(): Promise<{ userId: string | null; user: User | null }> { ... }
export async function currentUser(): Promise<User | null> { ... }
export async function requireAuth() { ... } // redirect dacă nu e logat

// User type
interface User {
  id: string;
  email: string | null;
  firstName: string;
  imageUrl: string;
}
```

---

## 🎯 FEATURES — Rețeaua de Socializare Medicală

### 1. 📝 FEED PRINCIPAL (Homepage)
- Feed cronologic + opțiune "Most Popular" (like Reddit hot/new)
- Postări cu: titlu, conținut (Markdown), tag-uri medicale, imagini opționale
- Tipuri de postări:
  - **Caz Clinic** — Prezentarea unui caz real/fictional cu discuție
  - **Discuție Generală** — Întrebare sau topic liber
  - **Articol/Rezumat** — Sharing de cunoștințe
  - **Întrebare Rapidă** — Q&A scurt
  - **Link Extern** — Sharing articole/studii
- Sorting: Hot (scor bazat pe voturi + recency), New, Top (zi/săptămână/lună/all-time)
- Infinite scroll cu SWR

### 2. 🏷️ SISTEM DE CATEGORII/COMUNITĂȚI (ca subreddit-urile)
- Comunități pe specializări medicale (mapate la `specializations` din Doctor):
  - Cardiologie, Neurologie, Gastroenterologie, Pneumologie, Nefrologie, Hematologie, Endocrinologie, Boli Infecțioase, Medicina Internă, Chirurgie, Pediatrie, Ginecologie, etc.
- Comunități speciale:
  - `general` — Discuții generale
  - `rezidențiat` — Pregătire rezidențiat
  - `cazuri-clinice` — Cazuri clinice exclusive
  - `off-topic` — Non-medical
  - `feedback-medlearn` — Feedback despre platforma MedLearn
- Fiecare comunitate are: icon, descriere, reguli, număr de membri, moderatori

### 3. 🗳️ SISTEM DE VOTURI
- Upvote / Downvote pe postări și comentarii (ca Reddit)
- Karma (reputație) per utilizator = suma netă a voturilor primite
- Nu se pot vota propriile postări/comentarii
- Animații smooth la vot (optimistic updates)

### 4. 💬 SISTEM DE COMENTARII
- Comentarii threaded/nested (arbore de răspunsuri, maxim 5 nivele)
- Markdown suport în comentarii
- Editare/ștergere comentariu propriu (în primele 15 minute)
- Sortare comentarii: Best, New, Old, Controversial
- Highlight pe comentariul autorului postării (OP badge)

### 5. 👤 PROFIL UTILIZATOR
- Pagina de profil cu:
  - Avatar + Nume (din MedLearn user_progress)
  - Karma total
  - Data înregistrării
  - Specializare principală (badge)
  - Experience level din MedLearn (student, rezident, doctor)
  - Statistici: postări, comentarii, voturi primite
  - Tab-uri: Postări / Comentarii / Saved / Voturi pozitive date
- Integrare cu datele din Doctor (streak, puncte, nivel experiență)

### 6. 🔖 BOOKMARKS & SAVED
- Salvare postări și comentarii
- Pagina "Saved" în profil

### 7. 🔔 NOTIFICĂRI
- Cineva răspunde la postarea ta
- Cineva îți dă reply la comentariu
- Cineva îți dă upvote (opțional, configurabil)
- Postare nouă în comunitate urmărită
- Badge count în header

### 8. 🔍 SEARCH
- Full-text search pe postări (titlu + conținut)
- Filtrare după comunitate, tip postare, autor, dată
- Search suggestions (autocomplete)

### 9. 📊 INTEGRARE CU MEDLEARN
- **Import Caz Clinic**: Buton "Discută acest caz" în MedLearn care creează automat o postare de tip "Caz Clinic" cu datele cazului pre-populate
- **Referință la Lecție**: Poți linka o lecție/curs din MedLearn într-o postare
- **Badge-uri MedLearn**: Afișează nivelul și badge-urile din MedLearn în profil
- **Cross-link**: Link-uri bidirecționale între rețea și platformă

### 10. 🛡️ MODERARE
- Report pe postări și comentarii
- Admin dashboard pentru moderare (review reports, ban users, remove posts)
- Auto-moderation: filtrare cuvinte interzise, spam detection basic
- Roluri: User, Moderator (per comunitate), Admin

---

## 🗄️ SCHEMA BAZĂ DE DATE (PostgreSQL separată, Drizzle ORM)

```typescript
// db/schema.ts — STRUCTURA COMPLETĂ

// ==================== ENUMS ====================
pgEnum("post_type", ["case_study", "discussion", "article", "quick_question", "external_link"])
pgEnum("vote_type", ["upvote", "downvote"])
pgEnum("report_status", ["pending", "reviewed", "resolved", "dismissed"])
pgEnum("notification_type", ["reply_post", "reply_comment", "upvote", "mention", "new_post_community"])
pgEnum("user_role", ["user", "moderator", "admin"])

// ==================== USERS (shadow table from MedLearn) ====================
// Sincronizat periodic sau la primul login pe rețea
network_users:
  - userId (text PK) — same as MedLearn user_progress.userId
  - userName (text)
  - userImageSrc (text)
  - bio (text, nullable) — scurt bio medical
  - specialization (text, nullable) — ex: "Cardiologie"
  - experienceLevel (text) — student/rezident/medic
  - karma (integer, default 0)
  - role (user_role enum, default "user")
  - isVerified (boolean, default false) — medic verificat
  - joinedAt (timestamp)
  - lastSeenAt (timestamp)
  - postCount (integer, default 0) — denormalizat pentru performance
  - commentCount (integer, default 0)

// ==================== COMMUNITIES ====================
communities:
  - id (serial PK)
  - slug (text, unique) — "cardiologie", "cazuri-clinice"
  - name (text) — "Cardiologie"
  - description (text)
  - rules (text) — markdown cu regulile comunității
  - iconSrc (text, nullable)
  - color (text) — hex color pentru UI
  - specializationId (integer, nullable) — FK la MedLearn specializations (read-only reference)
  - memberCount (integer, default 0)
  - postCount (integer, default 0)
  - isDefault (boolean) — comunități care apar pentru toți
  - createdAt (timestamp)
  - updatedAt (timestamp)
  Indexes: slug unique, specializationId

// ==================== COMMUNITY MEMBERSHIPS ====================
community_memberships:
  - id (serial PK)
  - userId (text) — FK la network_users
  - communityId (integer) — FK la communities
  - role (text) — "member", "moderator"
  - joinedAt (timestamp)
  Indexes: unique(userId, communityId), communityId

// ==================== POSTS ====================
posts:
  - id (serial PK)
  - userId (text) — FK la network_users (autorul)
  - communityId (integer) — FK la communities
  - title (text, notNull)
  - content (text) — Markdown content
  - type (post_type enum)
  - linkUrl (text, nullable) — pentru external_link
  - imageSrc (text, nullable) — imagine atașată
  - caseStudyId (integer, nullable) — referință la MedLearn case_studies.id
  - tags (text[]) — array de taguri medicale
  - upvotes (integer, default 0) — denormalizat
  - downvotes (integer, default 0) — denormalizat
  - score (integer, default 0) — upvotes - downvotes (denormalizat)
  - commentCount (integer, default 0) — denormalizat
  - viewCount (integer, default 0)
  - isPinned (boolean, default false)
  - isLocked (boolean, default false) — nu mai acceptă comentarii
  - isDeleted (boolean, default false) — soft delete
  - editedAt (timestamp, nullable)
  - createdAt (timestamp)
  - updatedAt (timestamp)
  Indexes: communityId+createdAt, userId, score+createdAt (for hot sort), tags (GIN)

// ==================== COMMENTS ====================
comments:
  - id (serial PK)
  - postId (integer) — FK la posts
  - userId (text) — FK la network_users
  - parentId (integer, nullable) — FK la comments (self-reference pentru threading)
  - content (text) — Markdown
  - depth (integer, default 0) — nivel de nesting (max 5)
  - upvotes (integer, default 0)
  - downvotes (integer, default 0)
  - score (integer, default 0)
  - isDeleted (boolean, default false) — soft delete (afișează "[deleted]")
  - editedAt (timestamp, nullable)
  - createdAt (timestamp)
  Indexes: postId+createdAt, userId, parentId

// ==================== VOTES ====================
votes:
  - id (serial PK)
  - userId (text) — FK la network_users
  - postId (integer, nullable) — FK la posts
  - commentId (integer, nullable) — FK la comments
  - type (vote_type enum) — upvote/downvote
  - createdAt (timestamp)
  Indexes: unique(userId, postId) WHERE postId IS NOT NULL,
           unique(userId, commentId) WHERE commentId IS NOT NULL
  Constraint: CHECK (postId IS NOT NULL OR commentId IS NOT NULL)

// ==================== BOOKMARKS ====================
bookmarks:
  - id (serial PK)
  - userId (text)
  - postId (integer, nullable)
  - commentId (integer, nullable)
  - createdAt (timestamp)
  Indexes: unique(userId, postId), unique(userId, commentId)

// ==================== NOTIFICATIONS ====================
notifications:
  - id (serial PK)
  - userId (text) — destinatarul
  - actorId (text) — cine a generat notificarea
  - type (notification_type enum)
  - postId (integer, nullable)
  - commentId (integer, nullable)
  - message (text) — text preview
  - isRead (boolean, default false)
  - createdAt (timestamp)
  Indexes: userId+isRead+createdAt, userId+createdAt

// ==================== REPORTS ====================
reports:
  - id (serial PK)
  - reporterId (text) — cine raportează
  - postId (integer, nullable)
  - commentId (integer, nullable)
  - reason (text)
  - details (text, nullable)
  - status (report_status enum)
  - resolvedBy (text, nullable)
  - resolvedAt (timestamp, nullable)
  - createdAt (timestamp)
  Indexes: status+createdAt

// ==================== POST VIEWS (opțional, pentru analytics) ====================
post_views:
  - id (serial PK)
  - postId (integer) — FK la posts
  - userId (text, nullable) — null pentru anonimi
  - viewedAt (timestamp)
  Indexes: postId+userId unique (prevent duplicate counting)
```

---

## 📂 STRUCTURA PROIECTULUI

```
retea_doctor/
├── app/
│   ├── (auth)/                    # Auth pages (redirect la MedLearn auth)
│   ├── (main)/                    # Layout principal cu sidebar
│   │   ├── layout.tsx             # Sidebar + Header layout
│   │   ├── page.tsx               # Feed principal (homepage)
│   │   ├── c/                     # Comunități
│   │   │   ├── page.tsx           # Lista comunități
│   │   │   └── [slug]/            # Comunitate individuală
│   │   │       ├── page.tsx       # Feed comunitate
│   │   │       └── about/         # Info comunitate
│   │   ├── post/
│   │   │   ├── new/page.tsx       # Creare postare
│   │   │   └── [id]/page.tsx      # Postare individuală + comentarii
│   │   ├── u/
│   │   │   └── [userId]/page.tsx  # Profil utilizator
│   │   ├── saved/page.tsx         # Bookmarks
│   │   ├── notifications/page.tsx # Notificări
│   │   └── search/page.tsx        # Căutare
│   ├── admin/                     # Admin/Moderare
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       ├── page.tsx           # Dashboard admin
│   │       ├── reports/page.tsx   # Gestionare rapoarte
│   │       ├── users/page.tsx     # Gestionare utilizatori
│   │       └── communities/page.tsx # Gestionare comunități
│   ├── api/
│   │   ├── posts/                 # CRUD postări
│   │   │   ├── route.ts           # GET (list) + POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts       # GET, PUT, DELETE
│   │   │       └── vote/route.ts  # POST (vote)
│   │   ├── comments/
│   │   │   ├── route.ts           # POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts       # PUT, DELETE
│   │   │       └── vote/route.ts  # POST (vote)
│   │   ├── communities/
│   │   │   ├── route.ts           # GET (list)
│   │   │   └── [slug]/
│   │   │       ├── route.ts       # GET (details)
│   │   │       └── join/route.ts  # POST (join/leave)
│   │   ├── notifications/route.ts # GET + PUT (mark read)
│   │   ├── bookmarks/route.ts     # GET + POST + DELETE
│   │   ├── search/route.ts        # GET (full-text search)
│   │   ├── user/
│   │   │   └── [id]/route.ts      # GET profil
│   │   └── admin/
│   │       ├── reports/route.ts
│   │       └── moderation/route.ts
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Tailwind + custom styles
├── components/
│   ├── feed/
│   │   ├── post-card.tsx          # Card postare în feed
│   │   ├── post-list.tsx          # Lista infinită de postări
│   │   └── feed-sort-tabs.tsx     # Hot/New/Top tabs
│   ├── post/
│   │   ├── post-detail.tsx        # Vizualizare postare completă
│   │   ├── post-form.tsx          # Formular creare/editare
│   │   ├── post-type-badge.tsx    # Badge tip postare
│   │   └── markdown-renderer.tsx  # Renderer Markdown
│   ├── comments/
│   │   ├── comment-tree.tsx       # Arbore de comentarii
│   │   ├── comment-item.tsx       # Comentariu individual
│   │   └── comment-form.tsx       # Formular adăugare comentariu
│   ├── vote/
│   │   └── vote-buttons.tsx       # Upvote/Downvote cu animații
│   ├── community/
│   │   ├── community-card.tsx     # Card comunitate
│   │   ├── community-sidebar.tsx  # Info comunitate în sidebar
│   │   └── community-rules.tsx    # Reguli comunitate
│   ├── profile/
│   │   ├── profile-header.tsx     # Header profil
│   │   ├── profile-stats.tsx      # Statistici
│   │   └── profile-tabs.tsx       # Tabs postări/comentarii
│   ├── layout/
│   │   ├── sidebar.tsx            # Sidebar stânga (nav + comunități)
│   │   ├── header.tsx             # Header cu search + notificări
│   │   ├── right-sidebar.tsx      # Sidebar dreapta (trending, rules)
│   │   └── mobile-nav.tsx         # Navigare mobilă
│   ├── notifications/
│   │   ├── notification-bell.tsx  # Bell icon cu badge count
│   │   └── notification-list.tsx  # Lista notificări
│   ├── search/
│   │   └── search-bar.tsx         # Search input cu autocomplete
│   ├── ui/                        # shadcn/ui components (copiază din Doctor)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── input.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── sheet.tsx
│   │   ├── separator.tsx
│   │   ├── tooltip.tsx
│   │   └── sonner.tsx
│   ├── providers/
│   │   ├── swr-provider.tsx
│   │   └── theme-provider.tsx
│   └── modals/
│       ├── report-modal.tsx       # Modal raportare
│       └── delete-confirm-modal.tsx
├── db/
│   ├── schema.ts                  # Schema Drizzle ORM (de mai sus)
│   ├── drizzle.ts                 # Conexiune DB
│   ├── queries.ts                 # Query functions cache-ate
│   └── migrations/                # Drizzle migrations
├── lib/
│   ├── auth.ts                    # Autentificare (copiat din Doctor, IDENTIC)
│   ├── supabase-server.ts         # Supabase client server-side
│   ├── utils.ts                   # Utilities (cn, formatDate, timeAgo)
│   ├── rate-limit.ts              # Rate limiting
│   ├── markdown.ts                # Markdown parsing/sanitization
│   ├── hot-score.ts               # Algoritm scor "Hot" (Wilson score + time decay)
│   └── validators.ts              # Zod schemas pentru validare
├── hooks/
│   ├── use-posts.ts               # SWR hook pentru postări
│   ├── use-comments.ts            # SWR hook pentru comentarii
│   ├── use-notifications.ts       # SWR hook notificări + polling
│   └── use-vote.ts                # Hook pentru vot optimistic
├── stores/
│   └── modal-store.ts             # Zustand store pentru modale
├── actions/
│   ├── post-actions.ts            # Server Actions pentru postări
│   ├── comment-actions.ts         # Server Actions pentru comentarii
│   └── vote-actions.ts            # Server Actions pentru voturi
├── config/
│   ├── communities.ts             # Comunități seed/default
│   └── constants.ts               # Constante aplicație
├── scripts/
│   ├── seed-communities.ts        # Seed comunități default
│   └── migrate.ts                 # Run migrations
├── middleware.ts                   # Auth middleware (protecție rute)
├── tailwind.config.ts
├── drizzle.config.ts
├── tsconfig.json
├── package.json
├── next.config.js
└── .env.example
```

---

## 🔧 CERINȚE TEHNICE OBLIGATORII

### 1. Performance
- **Toate listele**: Infinite scroll cu SWR (`useSWRInfinite`)
- **Voturi**: Optimistic updates (update UI instant, revert la eroare)
- **Server Components** pentru pagini (data fetching pe server)
- **Client Components** doar unde e nevoie (interactivitate, voturi, forme)
- **Denormalizare** pe score, commentCount, viewCount (evită COUNT queries)
- **Rate Limiting**: Sliding window pe toate API-urile de scriere

### 2. Securitate
- **Zod validation** pe TOATE input-urile (server-side, neîncrezut niciodată în client)
- **Auth check** pe TOATE API-urile protejate
- **Sanitize Markdown** (XSS prevention) — folosește `DOMPurify` sau echivalent server-side
- **Soft delete** pe postări și comentarii (nu ștergere fizică)
- **Rate limit** agresiv pe voturi (30 voturi/minut), postări (5/oră), comentarii (20/minut)
- **CSRF** protection (Next.js built-in)
- **Parameterized queries** (Drizzle ORM face asta automat)

### 3. UX/UI
- **Dark mode default** (consistent cu MedLearn)
- **Responsive**: Mobile-first, funcțional pe 320px+
- **Loading skeletons** pe toate listele
- **Empty states** cu ilustrații și CTA
- **Error boundaries** cu mesaje prietenoase
- **Toast notifications** (Sonner) pentru acțiuni
- **Keyboard shortcuts**: `n` = new post, `j`/`k` = navigate posts, `a`/`z` = upvote/downvote

### 4. Algoritm "Hot Score" (Reddit-style)
```typescript
// lib/hot-score.ts
function hotScore(upvotes: number, downvotes: number, createdAt: Date): number {
  const score = upvotes - downvotes;
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const seconds = (createdAt.getTime() - new Date("2026-01-01").getTime()) / 1000;
  return Number((sign * order + seconds / 45000).toFixed(7));
}
```

### 5. Seed Data
- Creează 12+ comunități default (mapate pe specializările din MedLearn)
- Creează 5-10 postări demo per comunitate
- Creează comentarii demo cu threading

---

## 📝 REGULI STRICTE

1. **NU folosi Prisma** — DOAR Drizzle ORM
2. **NU folosi NextAuth/Auth.js** — DOAR Supabase Auth (identic cu Doctor)
3. **NU folosi MongoDB** — DOAR PostgreSQL
4. **NU folosi Material UI sau Chakra** — DOAR Tailwind + shadcn/ui
5. **LIMBA**: Interfața în **Română** (butoane, labels, mesaje), comentarii/cod în Engleză
6. **FIECARE fișier** trebuie să aibă TypeScript strict, zero `any`
7. **FIECARE API route** trebuie să aibă: auth check, rate limit, Zod validation, error handling, Server-Timing header
8. **Copiază exact** pattern-urile din Doctor pentru: auth, middleware, rate limiting, db connection, error handling
9. **Conexiune DB separată** — URL diferit de Doctor, dar aceeași structură de conectare Drizzle

---

## 🚀 ENVIRONMENT VARIABLES (.env.example)

```env
# Database (SEPARATĂ de Doctor!)
DATABASE_URL=postgresql://user:pass@host:5432/retea_doctor

# Supabase (ACEEAȘI instanță ca Doctor — share auth)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_MEDLEARN_URL=http://localhost:3000

# Admin
ADMIN_PASSWORD=your-admin-password
ADMIN_SESSION_SECRET=your-session-secret
```

---

## 🎨 COMPONENTE UI CHEIE (Detalii implementare)

### PostCard (Feed item)
```
┌─────────────────────────────────────────────┐
│ ▲  125  │ 🏷️ Caz Clinic  •  r/Cardiologie  │
│ ▼       │                                    │
│         │ Infarct miocardic la pacient...     │
│         │ Preview text 2-3 linii...           │
│         │                                    │
│         │ 👤 Dr. Popescu • 3h • 💬 23 • 👁 156│
└─────────────────────────────────────────────┘
```

### Sidebar Layout
```
┌──────────┬─────────────────────┬────────────┐
│ SIDEBAR  │    MAIN CONTENT     │  RIGHT     │
│          │                     │  SIDEBAR   │
│ 🏠 Home  │  ┌─ Sort Tabs ────┐ │            │
│ 🔥 Pop.  │  │ Hot│New│Top    │ │ 📊 Trending│
│ ──────── │  └────────────────┘ │            │
│ Comunități│  ┌─ PostCard ────┐ │ 📋 Reguli  │
│ ❤️ Card. │  │               │ │            │
│ 🧠 Neuro │  └────────────────┘ │ 👥 Modera. │
│ 🫁 Pneum │  ┌─ PostCard ────┐ │            │
│ 📚 M.Int │  │               │ │ 🔗 MedLearn│
│ ...      │  └────────────────┘ │            │
└──────────┴──────────────────��──┴────────────┘
```

---

## ⚡ PRIORITĂȚI DE IMPLEMENTARE

### Faza 1 (MVP — obligatoriu):
1. ✅ Setup proiect Next.js 14 + TypeScript + Tailwind + Drizzle
2. ✅ Schema DB completă + migrations
3. ✅ Auth integration (copiat din Doctor)
4. ✅ CRUD Postări + Feed principal
5. ✅ Comunități (lista + join)
6. ✅ Sistem de voturi
7. ✅ Comentarii (cu threading)
8. ✅ Seed data

### Faza 2 (Completare):
9. Profil utilizator
10. Bookmarks/Saved
11. Notificări
12. Search
13. Admin dashboard + moderare

### Faza 3 (Nice-to-have):
14. Integrare deep cu MedLearn (import case studies)
15. Keyboard shortcuts
16. Real-time updates (SSE sau polling)
17. Rich text editor (TipTap)
18. Image upload (Supabase Storage)

---

Creează TOTUL într-un singur PR, complet funcțional, cu toate fișierele, seed data, și migrations. Aplicația trebuie să pornească cu `npm run dev` fără erori.
