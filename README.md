# TimeLoom — Dashboard & Pipeline Otomasi 3 Kanal YouTube Shorts + TikTok

> **Weave time-lapses into stories.** Satu dashboard untuk 3 kanal niche (SawdustSprint · BloomBlitz · WildLapse): generate ide → storyboard → prompt-pack → video (Flow/API) → overlay hook → caption → auto-publish → analytics loop.

**Stack:** Next.js 16 (App Router, `cacheComponents` + `connection()` + `instant=false`), Prisma 6 (SQLite dev / PostgreSQL prod), Gemini (`gemini-2.5-flash` + Omni Flash 1.1), ffmpeg, chokidar, Docker Compose. Semua state persisten (DB-backed queue, pg-bullmq + Redis wajib). Dokumen PRD: [`PRD-youtube-shorts-dashboard.md`](../PRD-youtube-shorts-dashboard.md).

---

## Menjalankan Lokal (dev)

### Prasyarat

- Node.js 22+ (`node -v` — tested `v25.8.1`)
- `ffmpeg` di PATH (`ffmpeg -version`)
- `npm` 11+

### Setup

```bash
npm install

cp .env.example .env
# Edit .env:
#   ENCRYPTION_KEY = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
#   GEMINI_MOCK=1   # mock fixture tanpa API key; kosongkan untuk API beneran
#   TZ_OPERATOR=Asia/Jakarta (atau zona Anda)

npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts        # 3 kanal + ProfilNiche

# Klip uji untuk QA komposisi
node scripts/klip-uji.mjs

# Terminal 1 — Next.js
npm run dev                   # http://localhost:3000

# Terminal 2 — Worker (queue + inbox watcher)
npm run dev:worker
```

### Mode Mock (`GEMINI_MOCK=1`) — tanpa API key

Semua generator (ide, prompt, caption, **storyboard**) memakai fixture lokal. Cocok untuk dev, demo, dan CI tanpa kredensial Gemini.

### Alur Cepat (smoke test)

1. Dashboard `http://localhost:3000` — 3 kanal + metrik + peringatan.
2. **Ide:** `POST /api/ide/generate` `{ "kanalId": "…" }` → 8 ide, 5 teratas masuk antrean.
3. **Storyboard (baru, sebelum Prompt Flow):** `/ide` → `🎬 Storyboard` pada ide → pilih **10s · 5 cut** atau **20s · 8 cut** → **Buat Storyboard** → timeline vertikal kontigu + `Generate Prompt per Cut` (slot `utama|alt1|alt2`) per baris cut. API:
   - `POST /api/storyboard/generate` `{ ideId, durasiTotal: 10|20, preset: "short"|"detail" }` — validasi `10↔short`, `20↔detail`; regenerasi idempotent per ide.
   - `GET /api/storyboard/[ideId]`
   - `POST /api/storyboard/[storyboardId]/cut/[cutId]/prompt` `{ slot?: "utama"|"alt1"|"alt2" }` → upsert `CutPrompt`.
4. **Prompt-pack klasik:** `POST /api/paket/[id]/prompt` atau Mode Flow UI `Salin Prompt`.
5. **Aset:** drop klip uji ke `storage/inbox/<kanal>/` → auto intake + validasi + composed `1080×1920`.
6. **Jadwal:** `GET /jadwal` — 5 slot per kanal, sequential queue.

---

## Deploy ke Server (Linux Intel Xeon — self-hosted, 24/7)

```bash
git clone <repo> && cd timeloom

# 1) Generate migration PostgreSQL (sekali)
node scripts/gen-migrasi-pg.mjs

# 2) Env produksi
cp .env.example .env
#   DATABASE_URL=postgresql://timeloom:password@postgres:5432/timeloom
#   ENCRYPTION_KEY=<64-char hex>
#   GEMINI_MOCK=       # kosongkan untuk API beneran
#   TZ_OPERATOR=...

# 3) Build & run
docker compose up -d

# 4) Migration + seed (di dalam container)
docker compose exec app npx prisma db push --schema prisma/schema.prisma
docker compose exec worker npx tsx prisma/seed.ts
```

### Switch Provider DB

```bash
node scripts/db-use.mjs sqlite       # dev (SQLite, default)
node scripts/db-use.mjs postgresql   # prod (PostgreSQL)
```

---

## Arsitektur

```
┌───────────────────────────────────────────────────────────────┐
│  Next.js 16 (App Router, TailwindCSS)                         │
│  ├── Dashboard (FR-1..3) — 3 kanal, pipeline, peringatan      │
│  ├── Mode Flow UI (FR-13) — Salin Prompt + rekap setelan      │
│  ├── Storyboard (baru) — /storyboard/[ideId] 10s/20s, 5/8-cut  │
│  ├── Asset Inbox (FR-13) — FormUnggahAset + watched folder    │
│  ├── /jadwal, /paket/[id], /pengaturan                        │
│  └── API Routes (REST — semua ƒ dynamic, storyboard ◐/ƒ)      │
├───────────────────────────────────────────────────────────────┤
│  Lapisan server (src/server/lapisan/)                         │
│  ├── ide.ts          — generator ide (FR-7..10, +playbook)     │
│  ├── storyboard.ts   — 5/8 cut, timeline kontigu, MOCK fixture │
│  ├── gemini.ts       — Gemini API + GEMINI_MOCK + responseSchema│
│  ├── prompt.ts       — 5-elemen + prohibition encoding + per-cut│
│  ├── validasi.ts     — prompt/caption/video + storyboard      │
│  ├── caption.ts      — caption YT/TT (FR-16)                   │
│  ├── omniFlash.ts    — Mode Auto Gemini Omni Flash API (M3)    │
│  ├── aset.ts         — intake (probe ffprobe+validasi)         │
│  ├── komposisi.ts    — ffmpeg overlay hook 0–3s (FR-15)        │
│  ├── penjadwal.ts    — scheduler 5 slot/kanal (FR-18)          │
│  ├── youtube.ts / tiktok.ts — upload + analytics (M2/M4)      │
│  ├── analytics.ts / playbook.ts / feedback.ts — M4             │
│  ├── storage.ts      — retensi 7/30 hari (§7.6)                │
│  └── killswitch.ts   — kill switch 3-posisi (FR-22)            │
├───────────────────────────────────────────────────────────────┤
│  Worker (src/worker/)                                          │
│  ├── Sequential job queue (DB-backed, pg-bullmq + Redis wajib) │
│  ├── Inbox watcher (chokidar) per kanal                        │
│  ├── Upload & analytics jobs (M2/M4)                           │
│  └── Boot catch-up                                              │
├───────────────────────────────────────────────────────────────┤
│  Storage (§7.6) + Prisma 6                                      │
│  ├── storage/raw/{kanal}/{tanggal}/          (7 hari)          │
│  ├── storage/composed/{kanal}/{tanggal}/     (30 hari)         │
│  ├── storage/inbox/{kanal}/  (watched folder, Mode Flow)       │
│  ├── storage/assets/{kanal}/                                   │
│  ├── Kanal, ProfilNiche, Ide, PromptPaket, CaptionSet,         │
│  │   PaketKonten, AsetVideo, SlotJadwal, Job, Kredensial,      │
│  │   Setelan, Peringatan                                        │
│  ├── Storyboard, StoryboardCut, CutPrompt (baru)               │
│  └── GayaVideo, FormulaPrompt, IdeChannelFaceless, PengubahPrompt│
│      (pustaka referensi: 33 + 100 + 50 + 99)                   │
└───────────────────────────────────────────────────────────────┘
```

### Pipeline Paket Konten

```
Antrean Ide → Storyboard (10s/5 atau 20s/8, opsional sebelum prompt)
           → Prompt Siap (prompt-pack 1+2 varian ATAU CutPrompt per cut)
           → Generating (Flow manual / Auto API) → Kotak Masuk Aset
           → Komposisi Overlay → Menunggu Review / Terjadwal → Tayang (YT+TT)
           ↘ Gagal/Retry (×3)
```

Storyboard: timeline absolut `detikAwal/detikAkhir` kontigu (5×2s untuk 10s; 3,3,3,3,2,2,2,2 untuk 20s), `gerakanKamera` dari `PengubahPrompt` (whitelist), `narasiId` Bahasa Indonesia 6–14 kata + `nadaTag` bervariasi per cut, `teksOverlay` per cut (boleh null).

---

## API (ringkas)

| Method | Path | Deskripsi |
|--------|------|-----------|
| POST | `/api/ide/generate` | Generate 8 ide per kanal (mock jika `GEMINI_MOCK=1`) |
| POST | `/api/ide/[id]` | `generate_prompt` — prompt-pack per ide |
| POST | `/api/paket/[id]/prompt` | Regenerate prompt-pack |
| POST | `/api/paket/[id]/caption` | Generate caption YT/TT |
| POST | `/api/storyboard/generate` | **Baru** — buat storyboard 10s/5 atau 20s/8 |
| GET | `/api/storyboard/[ideId]` | Ambil storyboard per ide |
| POST | `/api/storyboard/[storyboardId]/cut/[cutId]/prompt` | **Baru** — CutPrompt per cut (`utama|alt1|alt2`) |
| POST | `/api/aset/upload` | Upload aset raw |
| POST | `/api/publish/youtube/[paketId]` | Publish YouTube Shorts |
| POST | `/api/publish/tiktok/[paketId]` | Publish TikTok (Direct Post / Inbox) |
| GET/POST | `/api/analytics` | Sync analytics + Playbook Niche |

---

## Checklist Smoke Test

- [ ] `npx prisma db push && npx tsx prisma/seed.ts` → 3 kanal di Prisma Studio
- [ ] `GEMINI_MOCK=1` → `POST /api/ide/generate` → 8 ide/kanal
- [ ] **Storyboard:** `/ide` → `🎬 Storyboard` → 10s/5 cut & 20s/8 cut tertampil, timeline kontigu, validasi `valid/peringatan`
- [ ] **Per-cut prompt:** `POST …/cut/[cutId]/prompt {slot}` → `CutPrompt` tersimpan, `Salin Prompt Cut`
- [ ] Prompt-pack klasik: `Salin Prompt` → clipboard + rekap setelan Flow
- [ ] Caption: `#Shorts` wajib YT, dilarang TT
- [ ] Drop klip uji ke `storage/inbox/<kanal>/` → composed `1080×1920`, overlay 0–3s safe-area
- [ ] Kill switch `review` → `menunggu_review`; `auto` → `terjadwal`
- [ ] Dashboard 3 kanal + peringatan; `npm run build` 18 routes sukses

---

## Catatan Next.js 16

- DB di page: `import { connection } from "next/server"; await connection();` + `export const instant = false` (jangan `export const dynamic` bila `cacheComponents: true`).
- Dynamic route: `ctx: { params: Promise<{…}> }` → `await ctx.params`.

## Catatan Prisma

- **Prisma 6** (bukan 8 — tidak support SQLite). Schema portable: tanpa enum native, tanpa Json (pakai `String` JSON). Dev `prisma db push`, prod `gen-migrasi-pg.mjs`.

---

## Dokumen Terkait

- [`PRD-youtube-shorts-dashboard.md`](../PRD-youtube-shorts-dashboard.md) (v1.4 Final — sumber kebenaran)
- [`README-IMPL.md`](./README-IMPL.md) (panduan M1 terperinci)
- [`PANDUAN-SETUP-AKUN-US-EU.md`](../PANDUAN-SETUP-AKUN-US-EU.md) (setup akun audiens US/Eropa)
