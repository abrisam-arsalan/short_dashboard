/**
 * Kill Switch — mode efektif per kanal (FR-22).
 * 3 posisi: auto | review | jeda + opsi "ikut_global" pada kanal.
 */
import { db } from "@/lib/db";
import type { ModeKillSwitch } from "@/server/domain/status";

export type ModeEfektif = "auto" | "review" | "jeda";

/**
 * Hitung mode efektif untuk satu kanal.
 * Aturan: kanal "jeda" → jeda; global "jeda" → jeda (kecuali kanal override);
 * kanal "review" → review; else auto.
 */
export async function modeEfektif(kanalId: string): Promise<ModeEfektif> {
  const kanal = await db.kanal.findUnique({ where: { id: kanalId } });
  if (!kanal) return "jeda";

  const setelan = await db.setelan.findUnique({ where: { key: "killswitch_global" } });
  const globalMode = (setelan?.value ?? "auto") as ModeKillSwitch;
  const kanalMode = kanal.killSwitch as ModeKillSwitch;

  // Kanal "jeda" = absolut
  if (kanalMode === "jeda") return "jeda";

  // Kanal "ikut_global" = ikuti global
  if (kanalMode === "ikut_global") {
    return globalMode === "jeda" ? "jeda" : globalMode === "review" ? "review" : "auto";
  }

  // Kanal punya override eksplisit (auto/review)
  return kanalMode as ModeEfektif;
}

/** Cek apakah pipeline boleh lanjut otomatis */
export async function bolehOtomatis(kanalId: string): Promise<boolean> {
  return (await modeEfektif(kanalId)) === "auto";
}

/** Cek apakah pipeline harus berhenti di review */
export async function harusReview(kanalId: string): Promise<boolean> {
  return (await modeEfektif(kanalId)) === "review";
}

/** Cek apakah pipeline dijeda */
export async function dijeda(kanalId: string): Promise<boolean> {
  return (await modeEfektif(kanalId)) === "jeda";
}

/** Update kill switch kanal */
export async function updateKillSwitch(kanalId: string, mode: ModeKillSwitch) {
  return db.kanal.update({
    where: { id: kanalId },
    data: { killSwitch: mode },
  });
}

/** Update kill switch global */
export async function updateKillSwitchGlobal(mode: ModeKillSwitch) {
  return db.setelan.upsert({
    where: { key: "killswitch_global" },
    update: { value: mode },
    create: { key: "killswitch_global", value: mode },
  });
}
