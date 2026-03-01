# MedRețea — Rețeaua de Socializare Medicală

MedRețea este extensia socială a platformei **MedLearn** (repo `milozl1/Doctor`).
Cele două aplicații partajează un singur cont Supabase Auth dar folosesc baze de
date PostgreSQL separate — **o singură înregistrare, două platforme**.

---

## Arhitectură

```
┌──────────────────────────────────────────────────────────────┐
│                     Supabase Auth (comun)                    │
│           acelaşi proiect Supabase → acelaşi JWT userId      │
└───────────────────┬──────────────────────┬───────────────────┘
                    │                      │
          ┌─────────▼─────────┐  ┌─────────▼─────────┐
          │     MedLearn       │  │     MedRețea       │
          │   (repo Doctor)    │  │  (acest repo)      │
          │                    │  │                    │
          │  DB: doctor_db     │  │  DB: retea_doctor  │
          │  Port: 3000        │  │  Port: 3001        │
          │  Vercel project 1  │  │  Vercel project 2  │
          └────────────────────┘  └────────────────────┘
                    │                      │
                    └──── read-only ───────►
                    MEDLEARN_DATABASE_URL (opțional)
```

### Fluxul de autentificare

1. Utilizatorul se înregistrează **o singură dată** (pe MedLearn sau MedRețea)
2. Supabase Auth emite un JWT cu un `userId` unic
3. La primul acces pe MedRețea, layout-ul auto-creează un rând în `network_users`
   cu același `userId` — fără nici o acțiune din partea utilizatorului
4. Orice modificare de avatar/nume în Supabase Auth este sincronizată automat
   la fiecare vizită

---

## Stack tehnic

| Layer | Tehnologie |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Limbaj | TypeScript strict |
| Baza de date | PostgreSQL (Supabase) + Drizzle ORM |
| Autentificare | Supabase Auth (GoTrue) — identic cu Doctor |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| State | Zustand + SWR |
| Toasts | Sonner |
| Rate limiting | Custom sliding-window middleware |
| Validare | Zod (server + client) |

---

## Variabile de mediu

Copiază `.env.example` în `.env.local`:

```bash
cp .env.example .env.local
```

| Variabilă | Obligatorie | Descriere |
|-----------|-------------|-----------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL retea_doctor |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL proiect Supabase (ACELAȘI ca Doctor) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Cheia anon Supabase (ACEEAȘI ca Doctor) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key Supabase |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL public al acestei aplicații |
| `NEXT_PUBLIC_MEDLEARN_URL` | ✅ | URL platforma Doctor/MedLearn |
| `MEDLEARN_DATABASE_URL` | ⬜ | BD Doctor (opțional — activează stats MedLearn în profil și importul de cazuri clinice) |
| `ADMIN_PASSWORD` | ⬜ | Parolă dashboard admin |
| `ADMIN_SESSION_SECRET` | ⬜ | Secret sesiune admin |

> **Important:** `NEXT_PUBLIC_SUPABASE_URL` și `NEXT_PUBLIC_SUPABASE_ANON_KEY`
> trebuie să fie **identice** între Doctor și MedRețea. Aceasta este baza
> integrării — un singur proiect Supabase Auth, două baze de date separate.

---

## Instalare și pornire

```bash
# 1. Instalare dependențe
npm install

# 2. Copiere variabile de mediu
cp .env.example .env.local
# editează .env.local cu valorile reale

# 3. Generare și aplicare migrații
npm run db:generate
npm run db:push

# 4. Seed comunități default
npm run db:seed

# 5. Pornire server de dezvoltare (port 3001)
npm run dev
```

---

## Caracteristici cross-app

### Autentificare unificată
- Login / Sign-up direct în MedRețea (email + parolă sau Google OAuth)
- Același cont funcționează imediat pe MedLearn fără o a doua înregistrare
- Deconectare din MedRețea → invalidează sesiunea în ambele aplicații

### Import Caz Clinic din MedLearn
Când un caz clinic din MedLearn are un link „Discută pe MedRețea":
```
https://retea-doctor.vercel.app/post/new?caseStudyId=42
```
Formularul de creare postare preia automat titlul, descrierea și istoricul
pacientului din baza de date MedLearn și le pre-populează în câmpurile formularului.

### Statistici MedLearn în profil
Pagina de profil afișează (când `MEDLEARN_DATABASE_URL` este configurat):
- Puncte XP acumulate în MedLearn
- Streak curent (zile consecutive de activitate)
- Nivel de experiență (Student / Rezident / Medic)
- Specializarea principală

---

## Optimizări free-tier (Supabase + Vercel)

### Conexiuni DB
- Pool retea_doctor: `max: 3` conexiuni
- Pool MedLearn (read-only): `max: 1` conexiune
- `idle_timeout: 20s` — eliberează conexiunile inactive rapid
- Supabase free plan: 60 conexiuni totale → ambele aplicații folosesc maxim ~4

### Cache server
- Profiluri MedLearn: cache 5 minute (`unstable_cache`)
- Cazuri clinice: cache 1 oră
- Specializări: cache 24 ore

### SWR client
- `revalidateOnFocus: false` — nu refetch la schimbarea tab-ului
- `revalidateOnReconnect: false` — nu refetch la reconectarea la rețea
- `dedupingInterval: 60s` — deduplicare cereri identice

### Vercel
- Server Components pentru toate paginile publice → zero JS trimis la client
- Client Components doar pentru interactivitate (voturi, formulare, notificări)
- Soft-delete pe postări/comentarii → fără queries complexe de COUNT la ștergere

---

## Structura proiectului

```
retea_doctor/
├── app/
│   ├── (auth)/          # login, sign-up, forgot-password
│   ├── (main)/          # layout principal cu auto-sync user
│   │   ├── layout.tsx   # ← auto-upsert în network_users la fiecare vizită
│   │   ├── page.tsx     # feed principal
│   │   ├── c/[slug]/    # comunități
│   │   ├── post/[id]/   # postare individuală
│   │   ├── u/[userId]/  # profil (cu stats MedLearn)
│   │   ├── saved/       # bookmark-uri
│   │   └── notifications/
│   ├── admin/           # dashboard moderare
│   ├── api/
│   │   ├── auth/sync/   # upsert user în network_users
│   │   ├── medlearn/
│   │   │   ├── case-study/[id]/      # citire caz clinic din Doctor DB
│   │   │   └── user-progress/[userId]/ # citire XP/streak din Doctor DB
│   │   ├── posts/       # CRUD postări + voturi
│   │   ├── comments/    # CRUD comentarii + voturi
│   │   └── ...
│   └── auth/callback/   # handler OAuth + email confirmation
├── components/
│   ├── auth/            # LoginForm, SignUpForm, SignOutButton
│   ├── layout/          # Header (cu link MedLearn), Sidebar (cu link MedLearn)
│   ├── profile/
│   │   └── medlearn-stats.tsx  # widget XP/streak/level din MedLearn
│   └── ...
├── db/
│   ├── drizzle.ts       # client retea_doctor DB (pool: max 3)
│   ├── schema.ts        # schema retea_doctor
│   ├── medlearn-drizzle.ts  # client Doctor DB read-only (pool: max 1)
│   └── medlearn-schema.ts   # schema mirror Doctor (read-only subset)
└── lib/
    ├── auth.ts          # Supabase Auth helpers (identic cu Doctor)
    ├── supabase-server.ts  # server-side Supabase client
    ├── supabase-client.ts  # browser-side Supabase client (pentru forms)
    └── medlearn-client.ts  # helpers cached pentru citire din Doctor DB
```

---

## Deploy pe Vercel

1. Import repo pe [vercel.com](https://vercel.com) ca un proiect nou
2. Setează variabilele de mediu din `.env.example`
3. Asigură-te că `NEXT_PUBLIC_SUPABASE_URL` este identic cu cel din Doctor
4. Adaugă domeniul MedRețea în Supabase → Authentication → URL Configuration:
   - Site URL: `https://retea-doctor.vercel.app`
   - Redirect URLs: `https://retea-doctor.vercel.app/auth/callback`

---

## Comandă de migrare rapidă

```bash
# Generare SQL din schema Drizzle
npm run db:generate

# Aplicare migrații pe baza de date
npm run db:push

# Populare comunități default
npm run db:seed
```
