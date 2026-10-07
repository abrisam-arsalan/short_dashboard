/**
 * ffprobe wrapper — ambil info video (durasi, dimensi, codec, stream).
 */
import { spawn } from "child_process";

export interface InfoVideoFile {
  durasiDetik: number;
  lebar: number;
  tinggi: number;
  adaVideoStream: boolean;
  codec?: string;
  ukuranByte?: number;
}

/**
 * Probe file video → info durasi, dimensi, codec.
 */
export async function probeVideo(filePath: string): Promise<InfoVideoFile> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffprobe", [
      "-v", "quiet",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      filePath,
    ]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data: Buffer) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`ffprobe gagal (exit ${code}): ${stderr}`));
      }

      try {
        const data = JSON.parse(stdout);
        const videoStream = data.streams?.find(
          (s: Record<string, unknown>) => s.codec_type === "video",
        );
        const format = data.format ?? {};

        resolve({
          durasiDetik: parseFloat(format.duration ?? "0"),
          lebar: videoStream?.width ?? 0,
          tinggi: videoStream?.height ?? 0,
          adaVideoStream: !!videoStream,
          codec: videoStream?.codec_name,
          ukuranByte: parseInt(format.size ?? "0", 10),
        });
      } catch {
        reject(new Error("Gagal parse output ffprobe"));
      }
    });

    proc.on("error", (err) => {
      reject(new Error(`Gagal menjalankan ffprobe: ${err.message}`));
    });
  });
}
