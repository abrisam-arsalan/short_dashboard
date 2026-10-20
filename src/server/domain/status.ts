/**
 * Konstanta status pipeline & tipe — pengganti enum native (portable SQLite/PostgreSQL).
 * Semua kolom status di Prisma schema bertipe String, divalidasi oleh konstanta ini + zod.
 */

// === Status Pipeline PaketKonten (8 + gagal) ===
export const STATUS_PIPELINE = [
  "antrean_ide",
  "prompt_siap",
  "generating",
  "kotak_masuk_aset",
  "komposisi_overlay",
  "menunggu_review",
  "terjadwal",
  "tayang",
  "gagal",
] as const;

export type StatusPipeline = (typeof STATUS_PIPELINE)[number];

// Urutan transisi yang valid (untuk validasi perpindahan status)
export const URUTAN_STATUS: Record<StatusPipeline, StatusPipeline[]> = {
  antrean_ide: ["prompt_siap", "gagal"],
  prompt_siap: ["generating", "gagal"],
  generating: ["kotak_masuk_aset", "gagal"],
  kotak_masuk_aset: ["komposisi_overlay", "gagal"],
  komposisi_overlay: ["menunggu_review", "terjadwal", "gagal"],
  menunggu_review: ["terjadwal", "gagal"],
  terjadwal: ["tayang", "gagal"],
  tayang: [],
  gagal: ["generating"], // retry kembali ke generating
};

// === Status Ide ===
export const STATUS_IDE = ["tersedia", "dipakai", "dismiss"] as const;
export type StatusIde = (typeof STATUS_IDE)[number];

// === Kill Switch (3-posisi, FR-22) ===
export const MODE_KILL_SWITCH = ["auto", "review", "jeda", "ikut_global"] as const;
export type ModeKillSwitch = (typeof MODE_KILL_SWITCH)[number];

// === Mode Produksi (FR-13) ===
export const MODE_PRODUKSI = ["flow", "auto"] as const;
export type ModeProduksi = (typeof MODE_PRODUKSI)[number];

// === Tipe Aset Video ===
export const JENIS_ASET = ["raw", "composed"] as const;
export type JenisAset = (typeof JENIS_ASET)[number];

// === Sumber Aset ===
export const SUMBER_ASET = ["flow", "upload_form", "watcher", "api"] as const;
export type SumberAset = (typeof SUMBER_ASET)[number];

// === Durasi + Preset Storyboard ===
export const STORYBOARD_DURASI = [10, 20] as const;
export type StoryboardDurasi = (typeof STORYBOARD_DURASI)[number];
export const STORYBOARD_PRESET = ["short", "detail"] as const;
export type StoryboardPreset = (typeof STORYBOARD_PRESET)[number];
export const STATUS_STORYBOARD = ["draft", "valid", "ditolak"] as const;
export type StatusStoryboard = (typeof STATUS_STORYBOARD)[number];
export const SLOT_CUT_PROMPT = ["utama", "alt1", "alt2"] as const;
export type SlotCutPrompt = (typeof SLOT_CUT_PROMPT)[number];
export function jumlahCut(preset: StoryboardPreset): number {
  return preset === "short" ? 5 : 8;
}
export function detikPerCut(durasiTotal: StoryboardDurasi, preset: StoryboardPreset): number {
  const n = jumlahCut(preset);
  return durasiTotal / n;
}

// === Tipe Job (antrean) ===
export const TIPE_JOB = [
  "generate_ide",
  "generate_prompt",
  "generate_caption",
  "komposisi_overlay",
  "cleanup_storage",
  "isi_slot",
  "ingatkan",
  "publish_yt",
  "publish_tt",
  "cek_jadwal_tayang",
  "generate_video",
  "sync_analytics",
] as const;
export type TipeJob = (typeof TIPE_JOB)[number];

// === Status Job ===
export const STATUS_JOB = ["pending", "running", "done", "failed", "dead"] as const;
export type StatusJob = (typeof STATUS_JOB)[number];

// === Status Validasi Prompt ===
export const STATUS_VALIDASI = ["valid", "peringatan", "ditolak"] as const;
export type StatusValidasi = (typeof STATUS_VALIDASI)[number];

// === Provider Kredensial ===
export const PROVIDER_KREDENSIAL = ["gemini", "youtube_oauth", "tiktok_oauth"] as const;
export type ProviderKredensial = (typeof PROVIDER_KREDENSIAL)[number];
