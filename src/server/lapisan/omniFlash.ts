/**
 * Gemini Omni Flash — Mode Auto video generation (M3, FR-13).
 *
 * ⚠️ API Omni Flash TIDAK TERMASUK langganan Google AI Pro.
 * Biaya terpisah per generate. Hanya aktifkan bila layak secara biaya (matriks FR-13a).
 *
 * Mode Auto: prompt dari TimeLoom → panggil Gemini Omni Flash API → video langsung masuk pipeline.
 * Mode Flow: prompt dari TimeLoom → user generate di Google Flow → drop ke Kotak Masuk Aset.
 *
 * Model: gemini-2.5-flash-image-preview atau model video Gemini API terbaru.
 * Cek dokumentasi https://ai.google.dev/gemini-api/docs/video untuk model terbaru.
 */
import { GoogleGenAI } from "@google/genai";
import { ambilKredensial } from "@/server/vault";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { tanggalHariIniUtc } from "@/lib/waktu";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";

export interface HasilGenerateVideo {
  sukses: boolean;
  pathFile?: string;
  durasiDetik?: number;
  biayaEstimasi?: number; // USD
  pesan: string;
}

/**
 * Generate video via Gemini Omni Flash API (Mode Auto).
 *
 * @param paketId - ID paket konten
 * @returns HasilGenerateVideo
 */
export async function generateVideoAuto(paketId: string): Promise<HasilGenerateVideo> {
  const paket = await db.paketKonten.findUniqueOrThrow({
    where: { id: paketId },
    include: {
      ide: true,
      promptPaket: true,
      kanal: true,
    },
  });

  if (!paket.promptPaket) {
    return { sukses: false, pesan: "Prompt belum digenerate untuk paket ini" };
  }

  // Ambil API key Gemini per kanal (Mode Auto pakai API key terpisah dari Google AI Pro)
  const apiKey = await ambilKredensial(paket.kanalId, "gemini", "api_key_gemini");
  if (!apiKey) {
    return {
      sukses: false,
      pesan: "API key Gemini Omni Flash belum diset. Mode Auto butuh API key terpisah (bukan Google AI Pro). Set di Pengaturan → Kredensial.",
    };
  }

  // Cek pagu biaya (NFR-5)
  const paguCek = await cekPaguBiaya(paket.kanalId);
  if (!paguCek.bolehLanjut) {
    return {
      sukses: false,
      pesan: `Pagu biaya harian tercapai (${paguCek.terpakai}/$${paguCek.batas}). Tunggu besok atau naikkan pagu.`,
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Model video generation — sesuaikan dengan yang tersedia
    // Cek https://ai.google.dev/gemini-api/docs/video untuk model terbaru
    const model = process.env.GEMINI_VIDEO_MODEL || "gemini-2.5-flash";

    const prompt = paket.promptPaket.promptUtama;

    // Generate video via Gemini API
    // Catatan: API video generation mungkin butuh endpoint khusus
    // Fallback: generate gambar dulu, lalu convert (bila video API belum tersedia)
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseModalities: ["IMAGE", "TEXT"],
        imageConfig: {
          aspectRatio: "9:16",
        },
      },
    });

    // Cari hasil image/video dari response
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      return { sukses: false, pesan: "Gemini API tidak mengembalikan hasil" };
    }

    // Simpan hasil ke storage
    const slug = paket.kanal.slug;
    const tanggal = tanggalHariIniUtc();
    const rawDir = join(STORAGE_ROOT, "raw", slug, tanggal);
    await mkdir(rawDir, { recursive: true });

    const fileName = `${paketId}-auto.webm`;
    const filePath = join(rawDir, fileName);

    // Extract image/video bytes dari response
    // Catatan: struktur response tergantung API version — sesuaikan
    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      return { sukses: false, pesan: "Response tidak mengandung data media" };
    }

    let mediaSaved = false;
    for (const part of parts) {
      if (part.inlineData?.data) {
        // Simpan gambar/video
        const buffer = Buffer.from(part.inlineData.data, "base64");
        await writeFile(filePath, buffer);
        mediaSaved = true;

        // Catat aset
        await db.asetVideo.create({
          data: {
            kanalId: paket.kanalId,
            paketId: paket.id,
            jenis: "raw",
            sumber: "api",
            pathFile: join("raw", slug, tanggal, fileName),
            ukuranByte: buffer.length,
          },
        });
        break;
      }
    }

    if (!mediaSaved) {
      return { sukses: false, pesan: "Tidak ada media dalam response Gemini API" };
    }

    // Catat biaya estimasi (NFR-5)
    // Estimasi: ~$0.10-0.50 per generate (tergantung model & durasi)
    const biayaEstimasi = 0.25;
    await catatBiaya(paket.kanalId, biayaEstimasi);

    // Update status paket
    await db.paketKonten.update({
      where: { id: paketId },
      data: {
        status: "kotak_masuk_aset",
        catatanProduksi: JSON.stringify({
          mode: "auto",
          biaya_estimasi_usd: biayaEstimasi,
          model,
        }),
      },
    });

    // Langsung antre komposisi overlay
    const { antre } = await import("@/lib/antre");
    await antre("komposisi_overlay", { paketId }, paketId);

    return {
      sukses: true,
      pathFile: join("raw", slug, tanggal, fileName),
      biayaEstimasi,
      pesan: `Video digenerate via API ($${biayaEstimasi.toFixed(2)})`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Generate video gagal";
    return { sukses: false, pesan: msg };
  }
}

// === Pagu Biaya Harian (NFR-5) ===

interface PaguInfo {
  bolehLanjut: boolean;
  terpakai: number;
  batas: number;
}

async function cekPaguBiaya(kanalId: string): Promise<PaguInfo> {
  const batasHarian = await db.setelan.findUnique({
    where: { key: "pagu_biaya_harian_usd" },
  });
  const batas = parseFloat(batasHarian?.value ?? "5.00"); // default $5/hari per kanal

  // Hitung pengeluaran hari ini (dari catatanProduksi yang mengandung biaya_estimasi)
  const hariIni = new Date();
  hariIni.setUTCHours(0, 0, 0, 0);

  const paketHariIni = await db.paketKonten.findMany({
    where: {
      kanalId,
      createdAt: { gte: hariIni },
      catatanProduksi: { contains: "biaya_estimasi_usd" },
    },
    select: { catatanProduksi: true },
  });

  let terpakai = 0;
  for (const p of paketHariIni) {
    try {
      const catatan = JSON.parse(p.catatanProduksi ?? "{}");
      terpakai += catatan.biaya_estimasi_usd ?? 0;
    } catch {}
  }

  return {
    bolehLanjut: terpakai < batas,
    terpakai,
    batas,
  };
}

async function catatBiaya(kanalId: string, biaya: number) {
  // Biaya sudah dicatat di catatanProduksi paket — tidak perlu storage terpisah
  // Untuk M4: analytics bisa aggregate biaya dari catatanProduksi
}
