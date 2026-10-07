#!/usr/bin/env node
/**
 * Buat klip video uji via ffmpeg (testsrc2 + sine audio) untuk QA pipeline.
 * Pakai: node scripts/klip-uji.mjs [output.mp4] [detik]
 * Default: storage/tmp/klip-uji.mp4, 8 detik
 */
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const output = process.argv[2] || join(ROOT, "storage", "tmp", "klip-uji.mp4");
const detik = process.argv[3] || "8";

console.log(`🎬 Membuat klip uji: ${output} (${detik} detik, 1080x1920, 30fps)`);

execSync(
  [
    "ffmpeg -y",
    `-f lavfi -i "testsrc2=size=1080x1920:rate=30:duration=${detik}"`,
    `-f lavfi -i "sine=frequency=440:duration=${detik}"`,
    "-c:v libx264 -preset veryfast -crf 23",
    "-c:a aac -b:a 128k",
    "-pix_fmt yuv420p",
    `-t ${detik}`,
    `"${output}"`,
  ].join(" "),
  { stdio: "inherit" },
);

console.log(`✅ Klip uji tersimpan: ${output}`);
