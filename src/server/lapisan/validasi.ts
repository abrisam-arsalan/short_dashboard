/**
 * Validator — validasi prompt, caption, dan video.
 *
 * Validator prompt (pre-generate):
 *   - 5 elemen wajib ada & non-kosong
 *   - Frasa single-shot anti-cut
 *   - Menyebut 9:16
 *   - Durasi 6–10 detik
 *   - Blok audio eksplisit
 *   - Prohibition encoding (positive framing, reject daftar negatif mentah)
 *   - Panjang 3–5 kalimat (peringatan bila >7)
 *
 * Validator caption:
 *   - YT judul ≤ 100 char, #Shorts wajib
 *   - TikTok teks ≤ 150 char, #Shorts DILARANG
 *   - 3–5 hashtag per platform
 *
 * Validator video (post-download):
 *   - Durasi 4–12 detik (toleransi ±2)
 *   - Rasio 9:16 (toleransi ±2%)
 *   - Ada video stream
 */
import type { StatusValidasi } from "@/server/domain/status";

// === Tipe Hasil Validasi ===
export interface TemuanValidasi {
  kode: string;
  pesan: string; // Bahasa Indonesia
  saran?: string;
  level: "error" | "peringatan";
}

export interface HasilValidasi {
  status: StatusValidasi;
  temuan: TemuanValidasi[];
}

// === Validator Prompt ===
export function validasiPrompt(teksPrompt: string): HasilValidasi {
  const temuan: TemuanValidasi[] = [];

  // 1. Minimal 5 kalimat (5 elemen + audio)
  const kalimat = teksPrompt
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
  if (kalimat.length < 5) {
    temuan.push({
      kode: "ELEMEN_KURANG",
      pesan: "Prompt terlalu pendek — minimal 5 elemen (kamera, gaya, cahaya, lokasi, aksi) + audio",
      saran: "Pastikan semua 5 elemen terisi dalam prompt",
      level: "error",
    });
  } else if (kalimat.length > 7) {
    temuan.push({
      kode: "TERLALU_PANJANG",
      pesan: `Prompt terlalu panjang (${kalimat.length} kalimat) — ideal 3–5 kalimat`,
      saran: "Ringkas elemen yang tumpang tindih",
      level: "peringatan",
    });
  }

  // 2. Anti-cut / single-shot
  if (!/continuous|single shot|one shot|locked-off|static camera|no cuts/i.test(teksPrompt)) {
    temuan.push({
      kode: "TANPA_ANTI_CUT",
      pesan: "Tidak ada frasa single-shot / anti-cut",
      saran: 'Tambahkan "One continuous shot, no cuts" atau "Single locked-off camera"',
      level: "error",
    });
  }

  // 3. Format 9:16
  if (!/9:16|vertical|portrait/i.test(teksPrompt)) {
    temuan.push({
      kode: "TANPA_FORMAT",
      pesan: "Tidak menyebut format 9:16 (vertikal)",
      saran: 'Tambahkan "Vertical 9:16" di header prompt',
      level: "peringatan",
    });
  }

  // 4. Durasi 6–10 detik
  const durasiMatch = teksPrompt.match(/(\d+)\s*seconds?/i);
  if (durasiMatch) {
    const durasi = parseInt(durasiMatch[1], 10);
    if (durasi < 6 || durasi > 10) {
      temuan.push({
        kode: "DURASI_INVALID",
        pesan: `Durasi ${durasi} detik di luar rentang 6–10 detik`,
        saran: "Ubah durasi ke 6, 8, atau 10 detik",
        level: "error",
      });
    }
  } else {
    temuan.push({
      kode: "TANPA_DURASI",
      pesan: "Tidak menyebut durasi video",
      saran: 'Tambahkan durasi (mis. "8 seconds")',
      level: "peringatan",
    });
  }

  // 5. Blok audio eksplisit
  if (!/audio|sound|sfx|noise|whir|rustl|birds|wind|fire|crackl|music/i.test(teksPrompt)) {
    temuan.push({
      kode: "TANPA_AUDIO",
      pesan: "Tidak ada blok audio eksplisit (sumber suara)",
      saran: 'Tambahkan "The audio is [sumber suara], no music"',
      level: "error",
    });
  }

  // 6. Prohibition encoding — reject daftar negatif mentah
  // Deteksi pola "no X, no Y, no Z" (3+ daftar negatif berurutan)
  const daftarNegatif = teksPrompt.match(/\bno\s+[a-z]+(?:\s*[,.]\s*no\s+[a-z]+){2,}/gi);
  if (daftarNegatif) {
    temuan.push({
      kode: "LARANGAN_MENTAH",
      pesan: "Terdaftar pantangan sebagai daftar negatif mentah — harus positive framing",
      saran: 'Ganti "no cuts, no text, no watermark" → "Single locked-off camera. Clean frame without overlays."',
      level: "error",
    });
  }

  // 7. Cek positive framing minimal (harus ada frasa positif untuk pantangan)
  const adaPositif = /single locked-off|clean frame|only the subject|unbranded|fixed tripod/i.test(
    teksPrompt,
  );
  if (!adaPositif && teksPrompt.length > 100) {
    temuan.push({
      kode: "TANPA_POSITIVE_FRAMING",
      pesan: "Tidak ditemukan frasa positive framing untuk pantangan",
      saran: "Enkode pantangan sebagai frasa positif (lihat ENCODE_PANTANGAN)",
      level: "peringatan",
    });
  }

  // Hitung status
  const adaError = temuan.some((t) => t.level === "error");
  const adaPeringatan = temuan.some((t) => t.level === "peringatan");
  const status: StatusValidasi = adaError ? "ditolak" : adaPeringatan ? "peringatan" : "valid";

  return { status, temuan };
}

// === Validator Caption ===
export interface CaptionInput {
  ytJudul: string;
  ytDeskripsi: string;
  ytHashtag: string[]; // sudah di-parse dari JSON
  ttTeks: string;
  ttHashtag: string[]; // sudah di-parse dari JSON
}

export function validasiCaption(input: CaptionInput): HasilValidasi {
  const temuan: TemuanValidasi[] = [];

  // YouTube judul ≤ 100 char
  if (input.ytJudul.length > 100) {
    temuan.push({
      kode: "YT_JUDUL_PANJANG",
      pesan: `Judul YouTube ${input.ytJudul.length} karakter (maks 100)`,
      saran: "Pendekkan judul",
      level: "error",
    });
  }

  // #Shorts wajib di YouTube
  const ytHashtagLower = input.ytHashtag.map((h) => h.toLowerCase());
  if (!ytHashtagLower.includes("#shorts")) {
    temuan.push({
      kode: "SHORTS_KURANG",
      pesan: "#Shorts wajib ada di hashtag YouTube",
      saran: "Tambahkan #Shorts ke hashtag YouTube",
      level: "error",
    });
  }

  // #Shorts DILARANG di TikTok
  const ttHashtagLower = input.ttHashtag.map((h) => h.toLowerCase());
  if (ttHashtagLower.includes("#shorts")) {
    temuan.push({
      kode: "SHORTS_DILARANG",
      pesan: "#Shorts tidak boleh dipakai di caption TikTok",
      saran: "Hapus #Shorts dari hashtag TikTok",
      level: "error",
    });
  }

  // TikTok teks ≤ 150 char
  if (input.ttTeks.length > 150) {
    temuan.push({
      kode: "TT_TEKS_PANJANG",
      pesan: `Teks TikTok ${input.ttTeks.length} karakter (maks 150)`,
      saran: "Pendekkan teks TikTok",
      level: "error",
    });
  }

  // Jumlah hashtag per platform: 3–5
  if (input.ytHashtag.length < 3 || input.ytHashtag.length > 5) {
    temuan.push({
      kode: "YT_HASHTAG_JUMLAH",
      pesan: `Hashtag YouTube ${input.ytHashtag.length} (harus 3–5)`,
      level: "peringatan",
    });
  }
  if (input.ttHashtag.length < 3 || input.ttHashtag.length > 5) {
    temuan.push({
      kode: "TT_HASHTAG_JUMLAH",
      pesan: `Hashtag TikTok ${input.ttHashtag.length} (harus 3–5)`,
      level: "peringatan",
    });
  }

  const adaError = temuan.some((t) => t.level === "error");
  const adaPeringatan = temuan.some((t) => t.level === "peringatan");
  const status: StatusValidasi = adaError ? "ditolak" : adaPeringatan ? "peringatan" : "valid";

  return { status, temuan };
}

// === Validator Video (post-download) ===
export interface InfoVideo {
  durasiDetik: number;
  lebar: number;
  tinggi: number;
  adaVideoStream: boolean;
  codec?: string;
}

export function validasiVideo(info: InfoVideo): HasilValidasi {
  const temuan: TemuanValidasi[] = [];

  // Durasi 4–12 detik (toleransi ±2 di luar rentang model 4/6/8/10)
  if (info.durasiDetik < 4) {
    temuan.push({
      kode: "VIDEO_TERLALU_PENDEK",
      pesan: `Durasi video ${info.durasiDetik.toFixed(1)} detik (minimal 4 detik)`,
      saran: "Generate ulang dengan durasi lebih panjang",
      level: "error",
    });
  } else if (info.durasiDetik > 12) {
    temuan.push({
      kode: "VIDEO_TERLALU_PANJANG",
      pesan: `Durasi video ${info.durasiDetik.toFixed(1)} detik (maksimal 12 detik)`,
      saran: "Generate ulang dengan durasi lebih pendek",
      level: "error",
    });
  }

  // Rasio 9:16 (toleransi ±2%)
  if (info.adaVideoStream && info.lebar > 0 && info.tinggi > 0) {
    const rasio = info.lebar / info.tinggi;
    const rasioTarget = 9 / 16; // 0.5625
    const toleransi = 0.02; // ±2%
    if (Math.abs(rasio - rasioTarget) > toleransi) {
      temuan.push({
        kode: "RASIO_SALAH",
        pesan: `Rasio ${info.lebar}x${info.tinggi} (${(rasio * 16 / 9).toFixed(2)}:9) bukan 9:16`,
        saran: "Video akan di-crop otomatis ke 9:16 saat komposisi overlay",
        level: "peringatan",
      });
    }
  }

  // Ada video stream
  if (!info.adaVideoStream) {
    temuan.push({
      kode: "TANPA_VIDEO_STREAM",
      pesan: "File tidak memiliki video stream",
      saran: "Pastikan file adalah video (MP4/WebM)",
      level: "error",
    });
  }

  // Codec warning (H.264 ideal)
  if (info.codec && !/h264|h\.264|avc/i.test(info.codec)) {
    temuan.push({
      kode: "CODEC_BUKAN_H264",
      pesan: `Codec video "${info.codec}" bukan H.264`,
      saran: "Video akan ditranscode ke H.264 saat komposisi",
      level: "peringatan",
    });
  }

  const adaError = temuan.some((t) => t.level === "error");
  const adaPeringatan = temuan.some((t) => t.level === "peringatan");
  const status: StatusValidasi = adaError ? "ditolak" : adaPeringatan ? "peringatan" : "valid";

  return { status, temuan };
}
