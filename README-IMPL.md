# TimeLoom — Panduan Implementasi

> **Sumber kebenaran:** PRD v1.4 [`../PRD-youtube-shorts-dashboard.md`](../PRD-youtube-shorts-dashboard.md) + [`../PANDUAN-SETUP-AKUN-US-EU.md`](../PANDUAN-SETUP-AKUN-US-EU.md).

Status terkini: **M1–M4 + Storyboard selesai & ter-push** (`1433904`; `npx prisma db push` sinkron; `npm run build` sukses, `npx tsc --noEmit` clean).

## 1) Menjalankan Lokal

Lihat [`README.md`](./README.md) — bagian **Menjalankan Lokal** adalah referensi ringkas. Detail Phase di bawah tetap berlaku.

### Extra: Storyboard (sebelum Prompt Flow)

1. `/ide` → `🎬 Storyboard` pada ide → `/storyboard/[ideId]`.
2. Pilih **10 detik · 5 cut** atau **20 detik · 8 cut** → **Buat Storyboard** (mock langsung 5/8 cut bila `GEMINI_MOCK=1`).
3. Setiap cut: `VISUAL | GERAKAN KAMERA (/… ) | TEKS OVERLAY | NARASI (ID) | FUNGSI` + detik `Awal–Akhir` kontigu. **Generate Prompt per Cut** dengan slot `utama|alt1|alt2`, lalu **Salin Prompt Cut**.
4. API: `POST /api/storyboard/generate` `{ideId, durasiTotal:10|20, preset:"short"|"detail"}` (validasi `10↔short`, `20↔detail`), `GET /api/storyboard/[ideId]`, `POST /api/storyboard/[storyboardId]/cut/[cutId]/prompt`.

## 2) Deploy & Stack

Lihat [`README.md`](./README.md) — **Deploy ke Server** + **Arsitektur** + daftar API. Ringkas: Next.js 16 (App Router, `connection()` + `instant=false`), Prisma 6 (SQLite dev / PG prod), Gemini, ffmpeg, chokidar, Docker Compose.

## 3) Checklist M1–M4 + Storyboard

Disatukan di [`README.md`](./README.md) — **Checklist Smoke Test** (ide, storyboard 5/8 cut + per-cut prompt, prompt-pack klasik, caption #Shorts, komposisi 1080×1920, kill switch, dashboard, build 18 routes).

## 4) Catatan Next.js 16 & Prisma

Lihat [`README.md`](./README.md) — **Catatan Next.js 16** & **Catatan Prisma**.

## 5) Pustaka Referensi

Seed `prisma/seed-referensi.ts`: 33 GayaVideo + 100 FormulaPrompt + 50 IdeChannelFaceless + 99 PengubahPrompt (camera/lighting/composition …) dipakai untuk `gerakanKamera` storyboard.
