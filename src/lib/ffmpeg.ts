/**
 * ffmpeg wrapper — spawn ffmpeg dengan arg arrays (tanpa shell).
 * Drawtext pakai textfile= (UTF-8) untuk hindari masalah escaping.
 */
import { spawn } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

export interface OpsiOverlay {
  fileInput: string;
  fileOutput: string;
  fileFont: string; // path ke TTF
  teksHook: string; // teks overlay (hook)
  warnaTeks: string; // "#F2A93B"
  warnaBox: string; // "#1A120BCC"
  ukuranFont?: number; // default 88
  radiusBox?: number; // default 8
  durasiTampil?: number; // detik, default 3 (tampil 0-3 detik)
}

/**
 * Buat video composed dengan text overlay dibakar via ffmpeg.
 * - Normalisasi ke 1080x1920 (scale + crop)
 * - Text overlay di safe-area (y ≈ 0.22 × 1920 = 420px dari atas)
 * - Tampil 0–3 detik (configurable)
 * - Audio dipertahankan (-c:a copy bila AAC)
 */
export async function buatOverlay(opsi: OpsiOverlay): Promise<void> {
  const {
    fileInput,
    fileOutput,
    fileFont,
    teksHook,
    warnaTeks,
    warnaBox,
    ukuranFont = 88,
    radiusBox = 8,
    durasiTampil = 3,
  } = opsi;

  // Tulis hook ke temp file (UTF-8) untuk textfile= ffmpeg
  const fileTeks = join(tmpdir(), `hook-${Date.now()}.txt`);
  await writeFile(fileTeks, teksHook, "utf8");

  try {
    // Filter graph: scale → crop → fps → drawtext
    // Safe-area: y = H * 0.22 ≈ 420px (aman dari UI YouTube/TikTok)
    const filters = [
      "scale=1080:1920:force_original_aspect_ratio=increase",
      "crop=1080:1920",
      "fps=30",
      [
        "drawtext=",
        `fontfile='${fileFont.replace(/\\/g, "/")}'`,
        `:textfile='${fileTeks.replace(/\\/g, "/")}'`,
        `:fontsize=${ukuranFont}`,
        `:fontcolor=${warnaTeks}`,
        ":line_spacing=12",
        ":box=1",
        `:boxcolor=${warnaBox}`,
        `:boxborderw=${radiusBox}`,
        ":borderw=4",
        ":bordercolor=#000000AA",
        ":x=(w-text_w)/2",
        ":y=H*0.22",
        `:enable='between(t,0,${durasiTampil})'`,
      ].join(""),
      "format=yuv420p",
    ].join(",");

    const args = [
      "-y", // overwrite
      "-i", fileInput,
      "-vf", filters,
      "-c:v", "libx264",
      "-crf", "20",
      "-preset", "veryfast",
      "-c:a", "copy", // pertahankan audio asli
      "-movflags", "+faststart",
      fileOutput,
    ];

    await runFfmpeg(args);
  } finally {
    // Hapus temp file
    await unlink(fileTeks).catch(() => {});
  }
}

/**
 * Generate thumbnail dari video (frame t=1 detik).
 */
export async function buatThumbnail(fileInput: string, fileOutput: string): Promise<void> {
  const args = [
    "-y",
    "-i", fileInput,
    "-ss", "1", // frame di detik 1
    "-vframes", "1",
    "-vf", "scale=1080:1920",
    "-q:v", "3",
    fileOutput,
  ];
  await runFfmpeg(args);
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg gagal (exit ${code}):\n${stderr.slice(-500)}`));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Gagal menjalankan ffmpeg: ${err.message}`));
    });
  });
}
