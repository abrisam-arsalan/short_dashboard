/**
 * Storage — kebijakan retensi file + monitoring disk (§7.6).
 */
import { db } from "@/lib/db";
import { readdir, stat, unlink, mkdir } from "fs/promises";
import { join } from "path";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";

/**
 * Cleanup: hapus raw > 7 hari (yang sudah punya composed), composed > 30 hari.
 */
export async function cleanupStorage() {
  const setelanRaw = await db.setelan.findUnique({ where: { key: "retensi_raw_hari" } });
  const setelanComposed = await db.setelan.findUnique({ where: { key: "retensi_composed_hari" } });

  const retensiRaw = parseInt(setelanRaw?.value ?? "7", 10);
  const retensiComposed = parseInt(setelanComposed?.value ?? "30", 10);

  const now = Date.now();
  let dihapusRaw = 0;
  let dihapusComposed = 0;

  // Cleanup raw files > retensi yang sudah punya composed
  const rawAsets = await db.asetVideo.findMany({
    where: {
      jenis: "raw",
      dihapusPada: null,
      createdAt: { lt: new Date(now - retensiRaw * 86400000) },
      paket: { aset: { some: { jenis: "composed" } } }, // hanya yang sudah composed
    },
  });

  for (const aset of rawAsets) {
    const fullPath = join(STORAGE_ROOT, aset.pathFile);
    await unlink(fullPath).catch(() => {});
    await db.asetVideo.update({ where: { id: aset.id }, data: { dihapusPada: new Date() } });
    dihapusRaw++;
  }

  // Cleanup composed files > retensi
  const composedAsets = await db.asetVideo.findMany({
    where: {
      jenis: "composed",
      dihapusPada: null,
      createdAt: { lt: new Date(now - retensiComposed * 86400000) },
    },
  });

  for (const aset of composedAsets) {
    const fullPath = join(STORAGE_ROOT, aset.pathFile);
    await unlink(fullPath).catch(() => {});
    await db.asetVideo.update({ where: { id: aset.id }, data: { dihapusPada: new Date() } });
    dihapusComposed++;
  }

  // Cek disk usage (simplified — dalam produksi pakai check-disk-space)
  const diskInfo = await cekDisk();
  if (diskInfo.persen > 80) {
    await db.peringatan.create({
      data: {
        tipe: "disk_penuh",
        pesan: `Disk usage ${diskInfo.persen}% — melebihi 80%! Segera bersihkan storage.`,
      },
    });
  }

  return { dihapusRaw, dihapusComposed, diskInfo };
}

/** Cek disk usage (simplified) */
async function cekDisk(): Promise<{ persen: number; bebas: number }> {
  try {
    const files = await readdir(STORAGE_ROOT, { recursive: true }).catch(() => []);
    // Simplified — dalam produksi pakai `check-disk-space` atau `df`
    return { persen: 0, bebas: 100 * 1024 * 1024 * 1024 }; // placeholder
  } catch {
    return { persen: 0, bebas: 0 };
  }
}
