/**
 * Prompt Template — render deterministik dari JSON elemen ke teks prompt siap tempel.
 *
 * Prinsip: generate terstruktur (JSON) → render di kode (bukan minta model menghasilkan teks).
 * Ini menjamin konsistensi format 100% dan prohibition encoding dikerjakan kode.
 *
 * Kerangka 5-elemen (PRD §7.4):
 *   [1. KAMERA] Framing + gerak kamera
 *   [2. GAYA] Fast-motion time-lapse + gaya khas kanal
 *   [3. CAHAYA] Sumber & mood
 *   [4. LOKASI] Setting spesifik
 *   [5. AKSI] Transformasi inti
 *   [AUDIO] Sumber suara
 *   + Prohibition encoding (positive framing, bukan daftar negatif)
 */

// === Tipe Struktur Prompt ===
export interface ElemenPrompt {
  kamera: string;
  gaya: string;
  cahaya: string;
  lokasi: string;
  aksi: string;
  audio: string;
  hindariTerenkripsi: string[]; // frasa positif (bukan "no X")
}

export interface VarianPrompt {
  utama: ElemenPrompt;
  alt1: ElemenPrompt;
  alt2: ElemenPrompt;
}

// === Kamus Prohibition Encoding ===
// Pemetaan pantangan → frasa POSITIF (PRD §7.4 [HINDARI] block)
// Model video AI mengabaikan teks negatif ("no cuts"); constrain lewat positive framing.
export const ENCODE_PANTANGAN: Record<string, string> = {
  // Anti-cut / anti-kamera bergerak
  "potongan kamera": "Single locked-off camera, one continuous take",
  "no cuts": "Single locked-off camera, one continuous take",
  "camera movement": "Fixed tripod position throughout",
  "kamera bergerak": "Fixed tripod position throughout",

  // Anti-teks / watermark
  "teks": "Clean frame without overlays",
  "watermark": "Clean frame without overlays",
  "teks/watermark": "Clean frame without overlays",
  "text overlay": "Clean frame without overlays",

  // Anti-manusia menghadap kamera
  "orang menghadap kamera": "Only the subject in frame, no people facing camera",
  "humans facing camera": "Only the subject in frame, no people facing camera",
  "wajah manusia": "Only the subject in frame, no people facing camera",

  // Anti-logo/brand
  "logo": "Unbranded surfaces throughout",
  "brand": "Unbranded surfaces throughout",
};

/** Enkode satu pantangan → frasa positif. Fallback: wrap jadi positive framing sederhana. */
export function enkodePantangan(pantangan: string): string {
  const lower = pantangan.toLowerCase().trim();

  // Cek kamus persis
  if (ENCODE_PANTANGAN[lower]) return ENCODE_PANTANGAN[lower];

  // Cek substring match
  for (const [kunci, positif] of Object.entries(ENCODE_PANTANGAN)) {
    if (lower.includes(kunci)) return positif;
  }

  // Fallback: "no X" → "Clean frame without X"
  if (lower.startsWith("no ")) {
    return `Clean frame without ${lower.slice(3)}`;
  }

  // Fallback generik
  return `Scene with only the intended subject, no distractions`;
}

/** Enkode daftar pantangan → daftar frasa positif (dedup) */
export function enkodeSemuaPantangan(pantangan: string[]): string[] {
  const hasil = pantangan.map(enkodePantangan);
  return [...new Set(hasil)]; // dedup
}

// === Render Prompt ke Teks ===
const DURASI_DEFAULT = 8; // detik (antara 6-10)

/**
 * Render elemen prompt → teks siap tempel ke Google Flow.
 * Format: 5-elemen + audio + prohibition encoding (positive framing).
 */
export function renderPrompt(elemen: ElemenPrompt, durasiDetik: number = DURASI_DEFAULT): string {
  const durasi = Math.max(6, Math.min(10, durasiDetik));

  const bagian = [
    // Header: single shot + format
    `One continuous shot, no cuts. Vertical 9:16, ${durasi} seconds.`,

    // [1. KAMERA]
    elemen.kamera,

    // [2. GAYA]
    elemen.gaya,

    // [3. CAHAYA]
    elemen.cahaya,

    // [4. LOKASI]
    elemen.lokasi,

    // [5. AKSI]
    elemen.aksi,

    // [AUDIO] — selalu di akhir (PRD §7.4)
    `The audio is ${elemen.audio}.`,

    // Prohibition encoding — positive framing, bukan daftar negatif
    ...elemen.hindariTerenkripsi,
  ];

  return bagian.join(" ");
}

/** Render 3 varian (utama + 2 alternatif) → 3 teks prompt */
export function renderSemuaVarian(varian: VarianPrompt, durasiDetik?: number): {
  promptUtama: string;
  promptAlt1: string;
  promptAlt2: string;
  struktur: string; // JSON untuk disimpan di DB
} {
  return {
    promptUtama: renderPrompt(varian.utama, durasiDetik),
    promptAlt1: renderPrompt(varian.alt1, durasiDetik),
    promptAlt2: renderPrompt(varian.alt2, durasiDetik),
    struktur: JSON.stringify(varian),
  };
}

// === Contoh Penuh (untuk testing & referensi) ===
export const CONTOH_ELEMEN: ElemenPrompt = {
  kamera:
    "A locked-off overhead shot of a raised garden bed, camera completely static.",
  gaya: "Fast-motion time-lapse style, satisfying transformation, hyper-detailed natural textures.",
  cahaya:
    "Warm morning sunlight sweeping across the frame as the hours pass.",
  lokasi: "A wooden raised bed in a lush backyard garden.",
  aksi:
    "Bare soil bursts into full bloom: seedlings sprout, stretch, and explode into marigolds and tomatoes as the sun arcs overhead.",
  audio: "sped-up rustling leaves, birdsong and gentle wind, no music",
  hindariTerenkripsi: [
    "Single locked-off camera, one continuous take.",
    "Clean frame without overlays.",
  ],
};
