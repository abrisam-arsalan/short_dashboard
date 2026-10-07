/**
 * File Watcher — chokidar pada folder inbox per kanal (Mode Flow).
 * File yang di-drop ke inbox otomatis diproses.
 */
import chokidar from "chokidar";
type FSWatcher = ReturnType<typeof chokidar.watch>;
import { terimaAset } from "@/server/lapisan/aset";
import { join } from "path";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";
const USE_POLLING = process.env.WATCHER_POLLING === "1";

const KANAL_SLUGS = ["sawdustsprint", "bloomblitz", "wildlapse"];

/**
 * Mulai watcher pada semua folder inbox kanal.
 * @returns fungsi untuk stop watcher
 */
export function mulaiWatcher(): () => void {
  const watchers: FSWatcher[] = [];

  for (const slug of KANAL_SLUGS) {
    const inboxDir = join(STORAGE_ROOT, "inbox", slug);

    const watcher = chokidar.watch(inboxDir, {
      // Tunggu file selesai ditulis (2 detik stability) — Google Flow download bisa partial
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 200,
      },
      ignored: ["*.part", "*.crdownload", ".*", "_ditolak"],
      persistent: true,
      usePolling: USE_POLLING,
    });

    watcher.on("add", async (filePath) => {
      // Filter hanya file video
      if (!/\.(mp4|webm|mov|avi)$/i.test(filePath)) return;

      console.log(`📥 [${slug}] File baru di inbox: ${filePath}`);

      try {
        const hasil = await terimaAset(slug, filePath, "watcher");
        console.log(`   ${hasil.sukses ? "✅" : "❌"} ${hasil.pesan}`);
      } catch (err) {
        console.error(`   ❌ Gagal memproses ${filePath}:`, err);
      }
    });

    watchers.push(watcher);
    console.log(`👁️  Watching: ${inboxDir}`);
  }

  // Return stop function
  return () => {
    for (const w of watchers) {
      w.close();
    }
    console.log("👁️  Watcher dihentikan");
  };
}

/**
 * Scan awal semua inbox (catch-up setelah restart).
 */
export async function scanAwal(): Promise<number> {
  const { readdir } = await import("fs/promises");
  let total = 0;

  for (const slug of KANAL_SLUGS) {
    const inboxDir = join(STORAGE_ROOT, "inbox", slug);
    const files = await readdir(inboxDir).catch(() => []);

    for (const file of files) {
      if (!/\.(mp4|webm|mov|avi)$/i.test(file)) continue;

      const filePath = join(inboxDir, file);
      console.log(`📥 [${slug}] Scan awal: ${filePath}`);

      try {
        const hasil = await terimaAset(slug, filePath, "watcher");
        if (hasil.sukses) total++;
        console.log(`   ${hasil.sukses ? "✅" : "❌"} ${hasil.pesan}`);
      } catch (err) {
        console.error(`   ❌ Gagal:`, err);
      }
    }
  }

  return total;
}
