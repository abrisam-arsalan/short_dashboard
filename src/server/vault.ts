/**
 * Credential Vault — simpan/ambil kredensial per kanal terenkripsi (FR-6).
 * Setiap kanal punya vault terpisah: Gemini API key, YouTube OAuth, TikTok OAuth.
 */
import { db } from "@/lib/db";
import { enkripsi, dekripsi } from "@/lib/crypto";
import type { ProviderKredensial } from "@/server/domain/status";

/** Simpan kredensial (enkripsi otomatis) */
export async function simpanKredensial(
  kanalId: string,
  provider: ProviderKredensial,
  label: string,
  nilai: string,
): Promise<void> {
  const { ciphertext, iv, tag } = enkripsi(nilai);
  await db.kredensial.upsert({
    where: { kanalId_provider_label: { kanalId, provider, label } },
    update: { ciphertext, iv, tag },
    create: { kanalId, provider, label, ciphertext, iv, tag },
  });
}

/** Ambil kredensial (dekripsi otomatis) — return null bila tidak ada */
export async function ambilKredensial(
  kanalId: string,
  provider: ProviderKredensial,
  label: string,
): Promise<string | null> {
  const row = await db.kredensial.findUnique({
    where: { kanalId_provider_label: { kanalId, provider, label } },
  });
  if (!row) return null;
  return dekripsi({ ciphertext: row.ciphertext, iv: row.iv, tag: row.tag });
}

/** Hapus kredensial */
export async function hapusKredensial(
  kanalId: string,
  provider: ProviderKredensial,
  label: string,
): Promise<void> {
  await db.kredensial.deleteMany({ where: { kanalId, provider, label } });
}

/** Daftar label kredensial yang tersedia untuk satu kanal (tanpa nilai) */
export async function daftarKredensial(kanalId: string) {
  const rows = await db.kredensial.findMany({
    where: { kanalId },
    select: { provider: true, label: true, createdAt: true },
  });
  return rows;
}
