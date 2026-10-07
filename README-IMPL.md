# TimeLoom — Panduan Implementasi M1

Dashboard & otomasi multi-akun YouTube Shorts + TikTok.
**Status: M1 selesai** — generator ide/prompt/caption, Mode Flow UI, Asset Inbox, komposisi overlay ffmpeg, scheduler.

## Menjalankan Lokal (Development)

### Prasyarat
- Node.js 22+ (tested: v25.8.1)
- ffmpeg 9+ di PATH (`ffmpeg -version`)
- npm 11+

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Salin env
cp .env.example .env
# Edit .env: set ENCRYPTION_KEY (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 3. Setup database (SQLite lokal)
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# 4. Generate klip uji (untuk QA)
node scripts/klip-uji.mjs

# 5. Jalankan dev server (terminal 1)
npm run dev

# 6. Jalankan worker (terminal 2)
npm run dev:worker
```

### Mode Mock (tanpa API key)
Set `GEMINI_MOCK=1` di `.env` → semua generator pakai fixture, tanpa Gemini API.

### Testing Pipeline
1. Buka `http://localhost:3000` → dashboard 3 kanal
2. Generate ide: API `POST /api/ide/generate` dengan `{ "kanalId": "..." }`
3. Generate prompt: API `POST /api/ide/{id}` dengan `{ "aksi": "generate_prompt" }`
4. Drop klip uji ke `storage/inbox/sawdustsprint/` → otomatis terproses
5. Cek `/jadwal` untuk pipeline status

## Deploy ke Server (Linux Intel Xeon)

### Prasyarat Server
- Docker + Docker Compose
- ffmpeg (di-install di Docker image)
- Domain/IP untuk akses dashboard

### Deploy
```bash
# 1. Clone repo
git clone <repo-url> && cd timeloom

# 2. Generate migration PostgreSQL
node scripts/gen-migrasi-pg.mjs

# 3. Setup env
cp .env.example .env
# Edit .env untuk produksi:
#   DATABASE_URL="postgresql://timeloom:password@postgres:5432/timeloom"
#   ENCRYPTION_KEY="<64-char hex>"
#   GEMINI_MOCK="" (kosongkan untuk API beneran)

# 4. Build & run
docker compose up -d

# 5. Run migration
docker compose exec app node scripts/gen-migrasi-pg.mjs
docker compose exec app npx prisma db push --schema prisma/schema.prisma

# 6. Seed database
docker compose exec worker npx tsx prisma/seed.ts
```

### Switch Provider Database
```bash
node scripts/db-use.mjs sqlite      # dev (SQLite)
node scripts/db-use.mjs postgresql   # prod (PostgreSQL)
```

## Arsitektur

```
┌─────────────────────────────────────────────────────┐
│  Next.js 16 (App Router)                            │
│  ├── Dashboard (FR-1..3)                            │
│  ├── Mode Flow UI (FR-13) — Salin Prompt            │
│  ├── Asset Inbox (FR-13) — upload + watched folder  │
│  └── API Routes (REST)                              │
├─────────────────────────────────────────────────────┤
│  Services (src/server/lapisan/)                     │
│  ├── ide.ts       — Generator ide (FR-7..10)        │
│  ├── prompt.ts    — Prompt 5-elemen + prohibition   │
│  ├── validasi.ts  — Validator prompt/caption/video  │
│  ├── caption.ts   — Generator caption (FR-16)       │
│  ├── aset.ts      — Asset intake (probe+validasi)   │
│  ├── komposisi.ts — ffmpeg overlay (FR-15)          │
│  ├── penjadwal.ts — Scheduler 5 slot (FR-18)        │
│  ├── storage.ts   — Retensi 7/30 hari (§7.6)        │
│  └── killswitch.ts — Kill switch 3-posisi (FR-22)   │
├─────────────────────────────────────────────────────┤
│  Worker (src/worker/)                               │
│  ├── Sequential job queue (DB-backed)               │
│  ├── Inbox watcher (chokidar)                       │
│  └── Boot catch-up                                  │
├─────────────────────────────────────────────────────┤
│  Storage (§7.6)                                     │
│  ├── storage/raw/{kanal}/{tanggal}/   (7 hari)      │
│  ├── storage/composed/{kanal}/{tanggal}/ (30 hari)  │
│  ├── storage/inbox/{kanal}/  (watched folder)       │
│  └── storage/assets/{kanal}/  (thumbnails)          │
└─────────────────────────────────────────────────────┘
```

## Checklist Smoke Test M1

- [ ] `db:push` + `db:seed` → 3 kanal muncul di `prisma studio`
- [ ] `GEMINI_MOCK=1` → generate 8 ide/kanal dari mock
- [ ] Prompt-pack: 1 utama + 2 alternatif, tervalidasi
- [ ] Salin Prompt → clipboard berisi prompt siap tempel
- [ ] Caption: #Shorts wajib di YT, dilarang di TikTok
- [ ] Klip uji → drop ke inbox → auto intake → composed 1080×1920
- [ ] Overlay: teks tampil 0–3 detik, safe-area (y≈420px)
- [ ] Kill switch "review" → paket berhenti di menunggu_review
- [ ] Kill switch "auto" → paket langsung ke terjadwal
- [ ] Dashboard menampilkan 3 kanal + peringatan

## Catatan Next.js 16

- **`connection()`** dari `next/server` wajib untuk akses DB di page (Cache Components)
- **`export const instant = false`** di setiap page yang akses DB
- **`params`** di dynamic route adalah `Promise` — harus `await ctx.params`
- **`route.ts`** handlers: `ctx: RouteContext<'/path/[id]'>` untuk typed params

## Catatan Prisma

- Pakai **Prisma 6** (bukan 8) — Prisma 8 tidak support SQLite
- Schema portable: tanpa enum native, tanpa Json fields
- Dev: `prisma db push` (tanpa migration file)
- Prod: `node scripts/gen-migrasi-pg.mjs` → `prisma/migrations_pg/migration.sql`
