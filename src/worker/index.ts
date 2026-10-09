/**
 * Worker — sequential job queue processor + inbox watcher + catch-up boot.
 * Jalankan: npx tsx src/worker/index.ts
 */
import { db } from "@/lib/db";
import { ambilJobBerikut, tandaiSelesai, tandaiGagal, resetJobStuck, antre } from "@/lib/antre";
import { mulaiWatcher, scanAwal } from "@/lib/watcher";
import { dijeda } from "@/server/lapisan/killswitch";

const POLL_INTERVAL = 15000; // 15 detik

async function prosesJob(job: { id: string; tipe: string; payload: string; paketId: string | null }) {
  const payload = JSON.parse(job.payload) as Record<string, unknown>;

  // Cek kill switch sebelum eksekusi
  if (job.paketId) {
    const paket = await db.paketKonten.findUnique({
      where: { id: job.paketId },
      select: { kanalId: true },
    });
    if (paket && (await dijeda(paket.kanalId))) {
      console.log(`⏸️  Job ${job.tipe} dijeda (kill switch)`);
      return;
    }
  }

  console.log(`⚙️  Menjalankan job: ${job.tipe} (${job.id})`);

  switch (job.tipe) {
    case "generate_ide": {
      const { generateIde } = await import("@/server/lapisan/ide");
      await generateIde(payload.kanalId as string, payload.instruksi as string | undefined);
      break;
    }
    case "generate_prompt": {
      const { generatePromptPack } = await import("@/server/lapisan/ide");
      await generatePromptPack(payload.ideId as string);
      break;
    }
    case "generate_caption": {
      const { generateCaption } = await import("@/server/lapisan/caption");
      await generateCaption(payload.paketId as string);
      break;
    }
    case "komposisi_overlay": {
      const { prosesKomposisi } = await import("@/server/lapisan/komposisi");
      await prosesKomposisi(job.paketId ?? (payload.paketId as string));
      break;
    }
    case "cleanup_storage": {
      const { cleanupStorage } = await import("@/server/lapisan/storage");
      const hasil = await cleanupStorage();
      console.log(`   Cleanup: ${hasil.dihapusRaw} raw, ${hasil.dihapusComposed} composed`);
      break;
    }
    case "isi_slot": {
      const { isiSlotHarian, catchUpSlot } = await import("@/server/lapisan/penjadwal");
      await catchUpSlot();
      const hasil = await isiSlotHarian();
      console.log(`   Slot:`, hasil);
      break;
    }
    case "publish_yt": {
      const { handlePublishYt } = await import("@/worker/handlers/publish");
      await handlePublishYt(payload.paketId as string);
      break;
    }
    case "publish_tt": {
      const { handlePublishTt } = await import("@/worker/handlers/publish");
      await handlePublishTt(payload.paketId as string);
      break;
    }
    case "cek_jadwal_tayang": {
      const { cekJadwalTayang } = await import("@/server/lapisan/penjadwal");
      const hasil = await cekJadwalTayang();
      if (hasil.dijadwalkan > 0) {
        console.log(`   ${hasil.dijadwalkan} paket siap diupload`);
      }
      break;
    }
    case "generate_video": {
      const { handleGenerateVideo } = await import("@/worker/handlers/generateVideo");
      await handleGenerateVideo(payload.paketId as string);
      break;
    }
    case "sync_analytics": {
      const { handleSyncAnalytics } = await import("@/worker/handlers/analytics");
      await handleSyncAnalytics();
      break;
    }
    default:
      console.warn(`   Tipe job tidak dikenal: ${job.tipe}`);
  }
}

async function main() {
  console.log("🚀 TimeLoom Worker dimulai...");

  // Boot catch-up: reset job stuck
  await resetJobStuck();

  // Scan awal inbox (catch-up file yang di-drop saat worker mati)
  const fileDitemukan = await scanAwal();
  if (fileDitemukan > 0) {
    console.log(`📥 ${fileDitemukan} file diproses dari scan awal`);
  }

  // Mulai watcher inbox
  const stopWatcher = mulaiWatcher();

  // Reschedule cleanup job setiap hari jam 03:00 UTC
  await antre("cleanup_storage", {}, undefined, nextUtcHour(3));

  // Reschedule isi_slot job jam 04:00 UTC
  await antre("isi_slot", {}, undefined, nextUtcHour(4));

  // Reschedule analytics sync jam 06:00 UTC (48-72h lag — sync pagi untuk data 2-3 hari lalu)
  await antre("sync_analytics", {}, undefined, nextUtcHour(6));

  // Cek jadwal tayang setiap 2 menit (enqueue publish job yang waktunya sudah tiba)
  setInterval(async () => {
    try {
      await antre("cek_jadwal_tayang", {});
    } catch {}
  }, 120000);

  // Main loop — sequential processing
  console.log(`🔄 Polling setiap ${POLL_INTERVAL / 1000} detik...`);

  let running = true;
  process.on("SIGINT", () => {
    console.log("\n🛑 Worker dihentikan...");
    running = false;
    stopWatcher();
    process.exit(0);
  });

  while (running) {
    try {
      const job = await ambilJobBerikut();
      if (job) {
        await prosesJob(job as never);
        await tandaiSelesai(job.id);
        console.log(`   ✅ Job selesai: ${job.tipe}`);
      }
    } catch (err) {
      console.error("   ❌ Job gagal:", err);
      // Job ID sudah di-lock, akan di-reset oleh resetJobStuck
    }

    // Delay sebelum poll berikutnya
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));
  }
}

function nextUtcHour(jam: number): Date {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(jam, 0, 0, 0);
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
}

main().catch((err) => {
  console.error("Worker fatal error:", err);
  process.exit(1);
});
