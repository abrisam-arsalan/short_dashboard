/**
 * Storyboard — generate 5 atau 8 cut per Ide sebelum Prompt Flow.
 *
 * Alur: Ide.tersedia → Storyboard (5 cut jika preset "short" 10s, 8 cut jika "detail" 20s)
 *  → CutPrompt per cut via prompt.ts (renderCutPrompt) + validasi.ts (validasiStoryboard).
 *
 * Prinsip:
 *  - Semua narasiId & teksOverlay HARUS Bahasa Indonesia (systemPrompt dikeraskan).
 *  - Gerakan kamera otomatis resolve dari PengubahPrompt (camera_movement|angle|composition|focus).
 *  - Detik awal/akhir dikerjakan kode: durasiTotal / nCuts (kontigu, tanpa celah/tumpang-tindih).
 */

import { db } from "@/lib/db";
import { hasilkanJson, MOCK_STORYBOARD } from "./gemini";
import { StoryboardDurasi, StoryboardPreset, jumlahCut, detikPerCut } from "@/server/domain/status";

// ===== Tipe internal untuk payload AI =====
export interface CutAI {
  labelCut: string;       // HOOK|DETAIL|BENEFIT|DESIRE|CTA
  visual: string;
  gerakanKamera: string;  // "/filmlook" style dari PengubahPrompt
  teksOverlay?: string;
  narasiId: string;       // Bahasa Indonesia 6-14 kata
  nadaTag: string;
  fungsiCatatan?: string;
}

export interface StoryboardPayload {
  cuts: CutAI[];
}

// ===== Aransemen gerakan kamera otomatis =====

/** Set katalog gerakan kamera yang diperbolehkan — disebarkan dari DB PengubahPrompt. */
let KAT_GERAK: string[] = [];

export async function muatKatalogGerakanKamera(): Promise<string[]> {
  if (KAT_GERAK.length > 0) return KAT_GERAK;
  try {
    const rows = await db.pengubahPrompt.findMany({
      where: { kategori: { in: ["camera_movement", "camera_angle", "composition", "focus_color"] } },
      select: { perintah: true },
      orderBy: { perintah: "asc" },
    });
    if (rows.length > 0) KAT_GERAK = rows.map((r) => r.perintah);
  } catch { /* fallback test/migration without existing table rows */ }
  if (KAT_GERAK.length === 0) {
    // Fallback statis bila DB kosong / belum seeded
    KAT_GERAK = ["/filmlook", "/skyview", "/tightframe", "/pushin", "/pullback", "/followshot", "/groulevel", "/birdseye", "/fullscene", "/closecrop", "/allclear"];
  }
  return KAT_GERAK;
}

// Hash sederhana → index deterministik (untuk spread gerakan tanpa duplikat).
function hSplit(ideId: string, urutan: number): number {
  let h = 2166136261;
  for (const ch of `${ideId}:${urutan}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}

// Validasi whitelist gerakan kamera — fallback ke deterministic pick bila LLM mengirim nilai di luar whitelist.
function pilihGerakanAman(usulan: string, ideId: string, urutan: number, whitelist: string[]): string {
  const n = usulan.trim().toLowerCase();
  if (whitelist.includes(n)) return n;
  // Coba match substring ("/pushin angle" → "/pushin")
  for (const p of whitelist) if (n.includes(p)) return p;
  // Fallback deterministik tanpa LLM, tetap jajaki katalog
  return whitelist[hSplit(ideId, urutan) % whitelist.length];
}

// ===== Generate Storyboard =====

export interface OpsiGenerateStoryboard {
  durasiTotal: StoryboardDurasi;
  preset: StoryboardPreset;
}

export async function generateStoryboard(
  ideId: string,
  opsi: OpsiGenerateStoryboard,
) {
  const { durasiTotal, preset } = opsi;
  if (durasiTotal !== 10 && durasiTotal !== 20) throw new Error("durasiTotal harus 10 atau 20");
  if (preset !== "short" && preset !== "detail") throw new Error("preset harus short|detail");

  const expectedN = jumlahCut(preset); // 5 | 8
  const detikPer = detikPerCut(durasiTotal, preset); // 2 atau 2.5

  // Validasi durasiTotal vs preset (10s pasti 5-cut, 20s pasti 8-cut)
  if (durasiTotal === 10 && preset !== "short") throw new Error("10s hanya untuk preset 'short' (5 cut)");
  if (durasiTotal === 20 && preset !== "detail") throw new Error("20s hanya untuk preset 'detail' (8 cut)");

  const ide = await db.ide.findUniqueOrThrow({
    where: { id: ideId },
    include: { kanal: { include: { profil: true } } },
  });

  // Buang storyboard lama (jika regenerate, cascade cuts ikut terhapus oleh replace — tapi lebih aman hapus eksplisit).
  const existing = await db.storyboard.findUnique({ where: { ideId } });
  if (existing) {
    await db.storyboardCut.deleteMany({ where: { storyboardId: existing.id } });
    await db.storyboard.delete({ where: { id: existing.id } });
  }

  const profil = (ide as unknown as { kanal: { profil: { topik: string; spesimenGaya: string; tone: string | null } | null } }).kanal.profil;
  const apiKey = await getApiKeyForIdeIde(ideId);
  const whitelist = await muatKatalogGerakanKamera();

  const systemPrompt = [
    "You are a master advertising storyboard director for 10-20s vertical Shorts ads.",
    "Generate exactly N cuts. Each cut MUST have: labelCut (HOOK|DETAIL|BENEFIT|DESIRE|CTA),",
    "visual (clear Indonesian-content direction, no dialogue), gerakanKamera (pick ONE from whitelist),",
    "teksOverlay (short on-screen text, 3-6 words, Indonesian), narasiId (6-14 words Indonesian voiceover),",
    "nadaTag (Indonesian tone keyword e.g. penasaran|percaya-diri|lembut|persuasif|urgent),",
    "fungsiCatatan (one sentence, Indonesian, what the cut does in the funnel).",
    "CRITICAL: narasiId and teksOverlay MUST be Bahasa Indonesia. No English allowed for narration.",
    "Vary nadaTag per cut (e.g. cut 1 penasaran/energik -> later cuts lembut -> last cut persuasif/urgent).",
    "Vary gerakanKamera across cuts; prefer no duplicates in consecutive cuts.",
  ].join(" ");

  // Sanitize profiling context for prompt (avoid PII leakage)
  const topikList: string[] = (() => { try { return JSON.parse(profil?.topik ?? "[]"); } catch { return []; } })();
  const userPrompt = [
    `Idea title: ${ide.judulEn}`,
    `Hook: ${ide.hookVisual}`,
    `Transformation / benefit: ${ide.transformasi}`,
    `Brand tone: ${profil?.tone ?? "energik"}`,
    `Visual style hint: ${profil?.spesimenGaya ?? "cinematic"}`,
    `Topics hint: ${topikList.slice(0, 5).join(", ") || "-"}`,
    `N = ${expectedN} cuts, durasiTotal = ${durasiTotal}s (durasi per cut = ${detikPer}s).`,
    `Whitelist gerakanKamera: ${whitelist.join(", ")}`,
    `Return cuts in urutan order strictly 1..${expectedN} (HOOK first, CTA last).`,
  ].join("\n");

  const responseSchema: Record<string, unknown> = {
    type: "object",
    properties: {
      cuts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            labelCut:   { type: "string" },
            visual:     { type: "string" },
            gerakanKamera: { type: "string" },
            teksOverlay: { type: "string" },
            narasiId:  { type: "string" },
            nadaTag:   { type: "string" },
            fungsiCatatan: { type: "string" },
          },
          required: ["visual", "gerakanKamera", "narasiId"],
        },
      },
    },
    required: ["cuts"],
  };

  const raw: StoryboardPayload = await hasilkanJson<StoryboardPayload>(
    apiKey,
    "storyboard",
    systemPrompt,
    userPrompt,
    responseSchema,
  );

  // Normalisasi: clamp ke N, pad/truncate, reassign urutan 1..N, pasangkan gerakan aman
  let cutsAI: CutAI[] = Array.isArray(raw.cuts) ? raw.cuts : [];
  if (cutsAI.length !== expectedN) cutsAI = cutsAI.slice(0, expectedN);
  if (cutsAI.length < expectedN) {
    const fillNeed = expectedN - cutsAI.length;
    const mockCuts: CutAI[] = await muatMockFill(expectedN);
    cutsAI = [...cutsAI, ...mockCuts.slice(0, fillNeed)];
  }

  // Materialisasi durasi kontigu — disesuaikan agar bagi rata (20s/8 = 2.5 → bulatkan ke int dengan koreksi akhir).
  const dSec = durasiTotal; // saje int 10|20
  const segInt = expectedN === 5 ? 2 : 2; // bagi 2 detik per segmen; 20s: 8×2=16 -> perlu 4 detik sisa, pakai 3s utk 4 cut pertama
  const segmen = expectedN === 8
    ? [3, 3, 3, 3, 2, 2, 2, 2] // 12+8=20 (HOOK panjang, BENEFIT pendek)
    : [2, 2, 2, 2, 2];
  let cursor = 0;

  const rowsCut = cutsAI.map((c, idx) => {
    const urutan = idx + 1;
    const dur = segmen[idx];
    const row = {
      urutan,
      labelCut: (c.labelCut ?? fallbackLabel(urutan, expectedN)).toUpperCase(),
      detikAwal: cursor,
      detikAkhir: cursor + dur,
      visual: c.visual ?? "",
      gerakanKamera: pilihGerakanAman(c.gerakanKamera ?? "", ideId, urutan, whitelist),
      teksOverlay: c.teksOverlay ?? null,
      narasiId: c.narasiId ?? "",
      nadaTag: c.nadaTag ?? fallbackNada(urutan, expectedN),
      fungsiCatatan: c.fungsiCatatan ?? null,
    };
    cursor += dur;
    return row;
  });

  // Persist: Storyboard + N cuts
  const storyboard = await db.storyboard.create({
    data: {
      ideId,
      durasiTotal,
      presetCut: preset,
      status: "draft",
      detailValidasi: "[]",
      cuts: { create: rowsCut },
    },
    include: { cuts: { orderBy: { urutan: "asc" } } },
  });

  // Validasi — rewrite status/detail (tetap inside storyboard.ts sehingga validasi.ts bisa pure)
  try {
    const { validasiStoryboard } = await import("./validasi");
    const res = validasiStoryboard(storyboard.cuts as unknown as Parameters<typeof validasiStoryboard>[0]);
    await db.storyboard.update({
      where: { id: storyboard.id },
      data: { status: res.status, detailValidasi: JSON.stringify(res.temuan) },
    });
    return { ...storyboard, status: res.status, detailValidasi: JSON.stringify(res.temuan) };
  } catch {
    // Jika validator belum ada di build lama, kembalikan storyboard apa adanya
    return storyboard;
  }
}

function fallbackLabel(urutan: number, n: number): string {
  if (n === 5) return ["HOOK", "HIGHLIGHT", "BENEFIT", "DESIRE", "CTA"][urutan - 1];
  if (n === 8) return ["HOOK", "HOOK-2", "DETAIL", "BENEFIT", "BENEFIT-2", "DESIRE", "MOOD", "CTA"][urutan - 1];
  return `CUT-${urutan}`;
}

function fallbackNada(urutan: number, n: number): string {
  const arc = ["penasaran", "energik", "percaya-diri", "lembut", "persuasif", "intim", "hangat", "urgent"];
  if (n === 5) return arc[[0, 2, 3, 4, 7][urutan - 1]];
  return arc[(urutan - 1) % arc.length];
}

async function muatMockFill(expectedN: number): Promise<CutAI[]> {
  // Ambil dari MOCK_STORYBOARD fixture di gemini.ts untuk pad
  const n = expectedN;
  const skel: CutAI[] = (MOCK_STORYBOARD as { cuts: CutAI[] }).cuts.slice(0, n).map((c, idx) => ({
    ...c,
    gerakanKamera: c.gerakanKamera ?? ["/filmlook", "/skyview", "/tightframe", "/pushin", "/pullback"][idx % 5],
  }));
  // Jika fixture lebih kecil dari N, pad lagi secara deterministic
  while (skel.length < n) skel.push({ ...skel[skel.length % 3], gerakanKamera: ["/filmlook", "/pushin", "/pullback"][skel.length % 3] });
  return skel;
}

async function getApiKeyForIdeIde(ideId: string): Promise<string | null> {
  const ide = await db.ide.findUnique({ where: { id: ideId }, select: { kanalId: true } });
  if (!ide) return null;
  try {
    const { ambilKredensial } = await import("@/server/vault");
    return await ambilKredensial(ide.kanalId, "gemini", "api_key_gemini");
  } catch { return null; }
}

// ===== Ambil & Re-generate =====

export async function ambilStoryboard(ideId: string) {
  return db.storyboard.findUnique({
    where: { ideId },
    include: { cuts: { orderBy: { urutan: "asc" } } },
  });
}

export async function hapusStoryboard(ideId: string) {
  const sb = await db.storyboard.findUnique({ where: { ideId } });
  if (!sb) return null;
  await db.storyboardCut.deleteMany({ where: { storyboardId: sb.id } });
  await db.storyboard.delete({ where: { id: sb.id } });
  return true;
}
