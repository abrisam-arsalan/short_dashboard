/**
 * Generator Ide — AI menghasilkan ≥8 ide per kanal per hari (FR-7).
 * Playbook Niche kosong di M1 (cold start) — PLAYBOOK_SLOT disuntikkan dari M4.
 */
import { db } from "@/lib/db";
import { hasilkanJson } from "./gemini";
import { ambilKredensial } from "@/server/vault";
import { tanggalHariIniUtc } from "@/lib/waktu";

interface IdeAI {
  judulEn: string;
  hookVisual: string;
  transformasi: string;
  alasanPotensi: string;
  skor: number;
}

interface HasilIde {
  ideas: IdeAI[];
}

/**
 * Generate ide untuk satu kanal.
 * @param kanalId - ID kanal
 * @param instruksiVariasi - opsional: "lebih satisfying" / "lebih dramatis" / "variasi dari [ide]"
 */
export async function generateIde(kanalId: string, instruksiVariasi?: string) {
  const kanal = await db.kanal.findUniqueOrThrow({
    where: { id: kanalId },
    include: { profil: true },
  });

  if (!kanal.profil) {
    throw new Error(`Kanal ${kanal.slug} belum punya Profil Niche`);
  }

  // Ambil 14 judul terakhir untuk anti-pengulangan
  const ideTerakhir = await db.ide.findMany({
    where: { kanalId },
    orderBy: { createdAt: "desc" },
    take: 14,
    select: { judulEn: true },
  });

  const apiKey = await ambilKredensial(kanalId, "gemini", "api_key_gemini");

  // PLAYBOOK_SLOT — diisi dari M4 (Playbook Niche), kosong di cold start
  const { ambilPlaybookSlot } = await import("./feedback");
  const playbookSlot = await ambilPlaybookSlot(kanalId);

  const systemPrompt = `You are a viral short-form video idea generator for a fast time-lapse YouTube Shorts + TikTok channel.
Generate ideas that are visually dramatic, satisfying, and have clear before/after transformations.
ALL output must be in English. Score each idea 1-5 based on viral potential.
Return JSON matching the schema exactly.`;

  const topik = JSON.parse(kanal.profil.topik);
  const kataKunci = JSON.parse(kanal.profil.kataKunciEn);

  const userPrompt = `Channel: ${kanal.nama} — Niche: ${kanal.niche}
Style: ${kanal.profil.spesimenGaya}
Topics: ${topik.join(", ")}
Keywords: ${kataKunci.join(", ")}
${playbookSlot}
${instruksiVariasi ? `Variation request: ${instruksiVariasi}` : ""}
${ideTerakhir.length > 0 ? `Recent titles to avoid repeating: ${ideTerakhir.map((i) => i.judulEn).join("; ")}` : ""}
Today: ${tanggalHariIniUtc()}

Generate 8 ideas. Each idea must have a clear visual transformation (what changes into what).`;

  const responseSchema = {
    type: "object",
    properties: {
      ideas: {
        type: "array",
        items: {
          type: "object",
          properties: {
            judulEn: { type: "string" },
            hookVisual: { type: "string" },
            transformasi: { type: "string" },
            alasanPotensi: { type: "string" },
            skor: { type: "integer", minimum: 1, maximum: 5 },
          },
          required: ["judulEn", "hookVisual", "transformasi", "alasanPotensi", "skor"],
        },
      },
    },
    required: ["ideas"],
  };

  const hasil = await hasilkanJson<HasilIde>(
    apiKey,
    "ide",
    systemPrompt,
    userPrompt,
    responseSchema,
  );

  // Simpan semua ide ke DB
  const tanggalIde = new Date();
  const disimpan = [];

  for (const ide of hasil.ideas) {
    const row = await db.ide.create({
      data: {
        kanalId,
        tanggalIde,
        judulEn: ide.judulEn,
        hookVisual: ide.hookVisual,
        transformasi: ide.transformasi,
        alasanPotensi: ide.alasanPotensi,
        skor: Math.max(1, Math.min(5, ide.skor)),
        status: "tersedia",
      },
    });
    disimpan.push(row);
  }

  // 5 skor tertinggi → buat PaketKonten (status antrean_ide)
  const teratas = [...disimpan].sort((a, b) => b.skor - a.skor).slice(0, 5);
  for (const ide of teratas) {
    await db.paketKonten.create({
      data: {
        kanalId,
        ideId: ide.id,
        status: "antrean_ide",
      },
    });
    await db.ide.update({
      where: { id: ide.id },
      data: { status: "dipakai" },
    });
  }

  return disimpan;
}

/** Dismiss ide + feedback (FR-10) */
export async function dismissIde(ideId: string, alasan: string) {
  return db.ide.update({
    where: { id: ideId },
    data: { status: "dismiss", feedbackDismiss: alasan },
  });
}

/** Generate prompt-pack untuk satu ide */
export async function generatePromptPack(ideId: string) {
  const ide = await db.ide.findUniqueOrThrow({
    where: { id: ideId },
    include: { kanal: { include: { profil: true } } },
  });

  const profil = ide.kanal.profil!;
  const apiKey = await ambilKredensial(ide.kanalId, "gemini", "api_key_gemini");

  // Enkode pantangan dari profil
  const pantanganList = profil.larangan.split(",").map((p) => p.trim());

  const systemPrompt = `You are a video prompt engineer for Gemini Omni Flash 1.1 (Google Flow).
Generate structured JSON with 3 variants (main + 2 alternatives) for a fast time-lapse video.
Each variant has 5 elements: kamera (camera framing + movement), gaya (style), cahaya (lighting), lokasi (setting), aksi (action/transformation), audio (sound direction).
Rules:
- Camera must be static/locked-off (single continuous shot, no cuts)
- Audio must be specific (tools, nature sounds, etc.) and end with "no music"
- hindariTerenkripsi: positive framing phrases (NOT "no X" lists)
- Style must include: ${profil.spesimenGaya}
ALL output in English.`;

  const userPrompt = `Idea: ${ide.judulEn}
Hook: ${ide.hookVisual}
Transformation: ${ide.transformasi}
Channel style: ${profil.spesimenGaya}
Prohibitions to encode positively: ${pantanganList.join(", ")}

Generate 3 prompt variants as JSON.`;

  const responseSchema = {
    type: "object",
    properties: {
      varian: {
        type: "object",
        properties: {
          utama: { $ref: "#/definitions/elemen" },
          alt1: { $ref: "#/definitions/elemen" },
          alt2: { $ref: "#/definitions/elemen" },
        },
        required: ["utama", "alt1", "alt2"],
        definitions: {
          elemen: {
            type: "object",
            properties: {
              kamera: { type: "string" },
              gaya: { type: "string" },
              cahaya: { type: "string" },
              lokasi: { type: "string" },
              aksi: { type: "string" },
              audio: { type: "string" },
              hindariTerenkripsi: { type: "array", items: { type: "string" } },
            },
            required: ["kamera", "gaya", "cahaya", "lokasi", "aksi", "audio", "hindariTerenkripsi"],
          },
        },
      },
    },
    required: ["varian"],
  };

  const { hasilkanJson: _unused, ..._rest } = { hasilkanJson: null }; // suppress unused
  const hasil = await (await import("./gemini")).hasilkanJson<{
    varian: Record<string, Record<string, unknown>>;
  }>(apiKey, "prompt", systemPrompt, userPrompt, responseSchema);

  // Render deterministik ke teks prompt
  const { renderSemuaVarian, enkodeSemuaPantangan } = await import("./prompt");

  const prosesElemen = (e: Record<string, unknown>) => ({
    kamera: String(e.kamera ?? ""),
    gaya: String(e.gaya ?? ""),
    cahaya: String(e.cahaya ?? ""),
    lokasi: String(e.lokasi ?? ""),
    aksi: String(e.aksi ?? ""),
    audio: String(e.audio ?? ""),
    hindariTerenkripsi: Array.isArray(e.hindariTerenkripsi)
      ? (e.hindariTerenkripsi as string[])
      : enkodeSemuaPantangan(pantanganList),
  });

  const varian = {
    utama: prosesElemen(hasil.varian.utama),
    alt1: prosesElemen(hasil.varian.alt1),
    alt2: prosesElemen(hasil.varian.alt2),
  };

  const rendered = renderSemuaVarian(varian);

  // Validasi prompt
  const { validasiPrompt } = await import("./validasi");
  const validasi = validasiPrompt(rendered.promptUtama);

  // Simpan PromptPaket
  const promptPaket = await db.promptPaket.create({
    data: {
      ideId,
      promptUtama: rendered.promptUtama,
      promptAlt1: rendered.promptAlt1,
      promptAlt2: rendered.promptAlt2,
      struktur: rendered.struktur,
      statusValidasi: validasi.status,
      detailValidasi: JSON.stringify(validasi.temuan),
    },
  });

  // Update status paket → prompt_siap
  await db.paketKonten.updateMany({
    where: { ideId },
    data: { status: "prompt_siap" },
  });

  return promptPaket;
}
