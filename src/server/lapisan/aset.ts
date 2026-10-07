/**
 * Asset Intake — satu pintu masuk untuk semua video (form upload & watcher).
 * Alur: probe → validasi → pindah ke raw/ → pasangkan ke paket → antre komposisi.
 */
import { db } from "@/lib/db";
import { probeVideo } from "@/lib/ffprobe";
import { validasiVideo } from "./validasi";
import { antre } from "@/lib/antre";
import { rename, copyFile, unlink, mkdir } from "fs/promises";
import { join, basename, extname } from "path";
import { tanggalHariIniUtc } from "@/lib/waktu";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";

export interface HasilIntake {
  sukses: boolean;
  asetId?: string;
  pesan: string;
}

/**
 * Terima video dari inbox/upload → proses pipeline.
 * @param kanalSlug - slug kanal (sawdustsprint/bloomblitz/wildlapse)
 * @param pathSumber - path file video sumber
 * @param sumber - asal file ("upload_form" | "watcher" | "flow")
 */
export async function terimaAset(
  kanalSlug: string,
  pathSumber: string,
  sumber: "upload_form" | "watcher" | "flow",
): Promise<HasilIntake> {
  // Cari kanal
  const kanal = await db.kanal.findUnique({ where: { slug: kanalSlug } });
  if (!kanal) {
    return { sukses: false, pesan: `Kanal "${kanalSlug}" tidak ditemukan` };
  }

  // Probe video
  let info;
  try {
    info = await probeVideo(pathSumber);
  } catch {
    return { sukses: false, pesan: `Gagal membaca file video: ${basename(pathSumber)}` };
  }

  // Validasi video
  const validasi = validasiVideo(info);
  if (validasi.status === "ditolak") {
    // Pindahkan ke folder _ditolak
    const ditolakDir = join(STORAGE_ROOT, "inbox", "_ditolak");
    await mkdir(ditolakDir, { recursive: true });
    const ditolakPath = join(ditolakDir, `${Date.now()}-${basename(pathSumber)}`);
    await moveFile(pathSumber, ditolakPath);

    return {
      sukses: false,
      pesan: `Video ditolak: ${validasi.temuan.map((t) => t.pesan).join("; ")}`,
    };
  }

  // Pindahkan ke storage/raw/{kanal}/{tanggal}/
  const tanggal = tanggalHariIniUtc();
  const rawDir = join(STORAGE_ROOT, "raw", kanalSlug, tanggal);
  await mkdir(rawDir, { recursive: true });

  const namaFile = `${Date.now()}-${basename(pathSumber)}`;
  const rawPath = join(rawDir, namaFile);
  await moveFile(pathSumber, rawPath);

  // Buat record AsetVideo
  const aset = await db.asetVideo.create({
    data: {
      kanalId: kanal.id,
      jenis: "raw",
      sumber,
      pathFile: join("raw", kanalSlug, tanggal, namaFile),
      lebar: info.lebar,
      tinggi: info.tinggi,
      durasiDetik: info.durasiDetik,
      ukuranByte: info.ukuranByte,
    },
  });

  // Pasangkan ke paket: paket "generating"/"kotak_masuk_aset" tertua dgn kanal sama yang belum punya aset
  const paket = await db.paketKonten.findFirst({
    where: {
      kanalId: kanal.id,
      status: { in: ["generating", "kotak_masuk_aset"] },
      aset: { none: {} },
    },
    orderBy: { createdAt: "asc" },
    include: { ide: true },
  });

  if (paket) {
    await db.asetVideo.update({
      where: { id: aset.id },
      data: { paketId: paket.id },
    });

    await db.paketKonten.update({
      where: { id: paket.id },
      data: { status: "kotak_masuk_aset" },
    });

    // Antre komposisi overlay
    await antre("komposisi_overlay", { paketId: paket.id }, paket.id);
  }

  return {
    sukses: true,
    asetId: aset.id,
    pesan: paket
      ? `Video diterima & dipasangkan ke paket: ${paket.ide?.judulEn ?? paket.id}`
      : `Video diterima (belum ada paket yang menunggu)`,
  };
}

/** Move file (rename, fallback ke copy+unlink untuk cross-device) */
async function moveFile(sumber: string, tujuan: string): Promise<void> {
  try {
    await rename(sumber, tujuan);
  } catch {
    await copyFile(sumber, tujuan);
    await unlink(sumber).catch(() => {});
  }
}
