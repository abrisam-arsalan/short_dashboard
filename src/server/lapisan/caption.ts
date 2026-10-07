/**
 * Generator Caption — YouTube Shorts + TikTok (FR-16).
 * Validasi: #Shorts wajib di YT, dilarang di TikTok.
 */
import { db } from "@/lib/db";
import { hasilkanJson } from "./gemini";
import { ambilKredensial } from "@/server/vault";
import { validasiCaption, type CaptionInput } from "./validasi";

interface CaptionAI {
  ytJudul: string;
  ytDeskripsi: string;
  ytHashtag: string[];
  ttTeks: string;
  ttHashtag: string[];
}

export async function generateCaption(paketId: string) {
  const paket = await db.paketKonten.findUniqueOrThrow({
    where: { id: paketId },
    include: {
      ide: true,
      kanal: { include: { profil: true } },
    },
  });

  const apiKey = await ambilKredensial(paket.kanalId, "gemini", "api_key_gemini");

  const systemPrompt = `You are a social media caption writer for YouTube Shorts and TikTok.
Generate captions in English only.
Rules:
- YouTube title: max 100 characters, hook + niche keyword, MUST include #Shorts in hashtags
- YouTube description: 1-2 sentences + subtle CTA
- YouTube hashtags: 3-5, MUST include #Shorts + niche
- TikTok text: max 150 characters, casual, can be a question
- TikTok hashtags: 3-5, mix of niche + trending, MUST NOT include #Shorts
Return JSON matching the schema exactly.`;

  const userPrompt = `Video idea: ${paket.ide.judulEn}
Hook: ${paket.ide.hookVisual}
Transformation: ${paket.ide.transformasi}
Channel: ${paket.kanal.nama} — ${paket.kanal.niche}
Keywords: ${JSON.parse(paket.kanal.profil?.kataKunciEn ?? "[]").join(", ")}`;

  const responseSchema = {
    type: "object",
    properties: {
      ytJudul: { type: "string" },
      ytDeskripsi: { type: "string" },
      ytHashtag: { type: "array", items: { type: "string" } },
      ttTeks: { type: "string" },
      ttHashtag: { type: "array", items: { type: "string" } },
    },
    required: ["ytJudul", "ytDeskripsi", "ytHashtag", "ttTeks", "ttHashtag"],
  };

  const hasil = await hasilkanJson<CaptionAI>(
    apiKey,
    "caption",
    systemPrompt,
    userPrompt,
    responseSchema,
  );

  // Validasi caption
  const input: CaptionInput = {
    ytJudul: hasil.ytJudul,
    ytDeskripsi: hasil.ytDeskripsi,
    ytHashtag: hasil.ytHashtag,
    ttTeks: hasil.ttTeks,
    ttHashtag: hasil.ttHashtag,
  };
  const validasi = validasiCaption(input);

  // Jika #Shorts kurang di YT, tambahkan otomatis
  if (!input.ytHashtag.some((h) => h.toLowerCase() === "#shorts")) {
    input.ytHashtag.unshift("#Shorts");
  }

  // Jika #Shorts ada di TikTok, hapus
  input.ttHashtag = input.ttHashtag.filter((h) => h.toLowerCase() !== "#shorts");

  // Simpan CaptionSet
  const caption = await db.captionSet.upsert({
    where: { paketId },
    update: {
      ytJudul: input.ytJudul,
      ytDeskripsi: input.ytDeskripsi,
      ytHashtag: JSON.stringify(input.ytHashtag),
      ttTeks: input.ttTeks,
      ttHashtag: JSON.stringify(input.ttHashtag),
    },
    create: {
      paketId,
      ytJudul: input.ytJudul,
      ytDeskripsi: input.ytDeskripsi,
      ytHashtag: JSON.stringify(input.ytHashtag),
      ttTeks: input.ttTeks,
      ttHashtag: JSON.stringify(input.ttHashtag),
    },
  });

  return { caption, validasi };
}
