/**
 * Komposisi Overlay — orkestrasi ffmpeg untuk burn-in text overlay (FR-15).
 */
import { db } from "@/lib/db";
import { buatOverlay, buatThumbnail } from "@/lib/ffmpeg";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { tanggalHariIniUtc } from "@/lib/waktu";
import { bolehOtomatis, harusReview } from "./killswitch";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";

/**
 * Proses komposisi overlay untuk satu paket.
 * 1. Ambil aset raw + profil niche kanal
 * 2. Burn text overlay via ffmpeg
 * 3. Generate thumbnail
 * 4. Update status paket (menunggu_review / terjadwal)
 */
export async function prosesKomposisi(paketId: string) {
  const paket = await db.paketKonten.findUniqueOrThrow({
    where: { id: paketId },
    include: {
      aset: { where: { jenis: "raw" }, orderBy: { createdAt: "desc" }, take: 1 },
      ide: true,
      kanal: { include: { profil: true } },
    },
  });

  const asetRaw = paket.aset[0];
  if (!asetRaw) {
    throw new Error(`Paket ${paketId} belum punya aset raw`);
  }

  const profil = paket.kanal.profil!;
  const tanggal = tanggalHariIniUtc();
  const slug = paket.kanal.slug;

  // Path output
  const composedDir = join(STORAGE_ROOT, "composed", slug, tanggal);
  const assetsDir = join(STORAGE_ROOT, "assets", slug);
  await mkdir(composedDir, { recursive: true });
  await mkdir(assetsDir, { recursive: true });

  const namaFile = `${paketId}.mp4`;
  const composedPath = join(composedDir, namaFile);
  const thumbnailPath = join(assetsDir, `${paketId}.jpg`);

  // Hook text = judul ide (pendek, impact)
  const hookText = paket.ide.judulEn.length > 50
    ? paket.ide.hookVisual.split(",")[0].trim() // fallback: kalimat pertama hook visual
    : paket.ide.judulEn;

  // Ambil path file font (relatif ke root project)
  const fontPath = join(process.cwd(), profil.fontFile);

  // Path input (relatif ke STORAGE_ROOT)
  const inputPath = join(STORAGE_ROOT, asetRaw.pathFile);

  // Buat overlay
  await buatOverlay({
    fileInput: inputPath,
    fileOutput: composedPath,
    fileFont: fontPath,
    teksHook: hookText,
    warnaTeks: profil.warnaTeks,
    warnaBox: profil.warnaBox,
    ukuranFont: 88,
    radiusBox: profil.radiusBox,
    durasiTampil: 3,
  });

  // Buat thumbnail
  await buatThumbnail(composedPath, thumbnailPath);

  // Buat record AsetVideo composed
  await db.asetVideo.create({
    data: {
      kanalId: paket.kanalId,
      paketId: paket.id,
      jenis: "composed",
      sumber: "api",
      pathFile: join("composed", slug, tanggal, namaFile),
    },
  });

  // Update status paket berdasarkan kill switch
  const otomatis = await bolehOtomatis(paket.kanalId);
  const review = await harusReview(paket.kanalId);

  await db.paketKonten.update({
    where: { id: paket.id },
    data: {
      status: review ? "menunggu_review" : "terjadwal",
    },
  });

  return { composedPath, thumbnailPath };
}
