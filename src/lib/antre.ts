/**
 * Antrean Job — DB-backed queue (pengganti Redis untuk M1).
 * Interface `antre()` bisa diganti BullMQ+Redis di M2 tanpa ubah pemanggil.
 */
import { db } from "@/lib/db";
import type { TipeJob } from "@/server/domain/status";

/**
 * Tambahkan job ke antrean.
 * @param tipe - jenis job
 * @param payload - data JSON untuk handler
 * @param paketId - opsional, relasi ke PaketKonten
 * @param runAt - opsional, waktu eksekusi (default: sekarang)
 */
export async function antre(
  tipe: TipeJob,
  payload: Record<string, unknown>,
  paketId?: string,
  runAt?: Date,
) {
  return db.job.create({
    data: {
      tipe,
      payload: JSON.stringify(payload),
      paketId,
      runAt: runAt ?? new Date(),
    },
  });
}

/**
 * Ambil job berikutnya (sequential — satu per satu).
 * Lock job agar tidak diproses ganda.
 */
export async function ambilJobBerikut() {
  // Cari job pending yang sudah waktunya
  const job = await db.job.findFirst({
    where: {
      status: "pending",
      runAt: { lte: new Date() },
    },
    orderBy: { runAt: "asc" },
  });

  if (!job) return null;

  // Lock job
  const updated = await db.job.updateMany({
    where: { id: job.id, status: "pending" },
    data: { status: "running", lockedAt: new Date(), attempts: { increment: 1 } },
  });

  if (updated.count === 0) return null; // sudah di-lock oleh worker lain

  return { ...job, attempts: job.attempts + 1 };
}

/** Tandai job selesai */
export async function tandaiSelesai(jobId: string) {
  return db.job.update({
    where: { id: jobId },
    data: { status: "done" },
  });
}

/** Tandai job gagal — retry bila attempts < maxAttempts */
export async function tandaiGagal(jobId: string, error: string) {
  const job = await db.job.findUnique({ where: { id: jobId } });
  if (!job) return;

  const status = job.attempts >= job.maxAttempts ? "dead" : "failed";
  const runAt = status === "failed"
    ? new Date(Date.now() + Math.pow(2, job.attempts) * 60000) // exponential backoff
    : undefined;

  return db.job.update({
    where: { id: jobId },
    data: { status, lastError: error, runAt },
  });
}

/** Re-queue job yang stuck (locked > 5 menit) */
export async function resetJobStuck() {
  return db.job.updateMany({
    where: {
      status: "running",
      lockedAt: { lt: new Date(Date.now() - 5 * 60000) },
    },
    data: { status: "pending", lockedAt: null },
  });
}
