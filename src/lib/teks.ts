/**
 * Kamus teks UI Bahasa Indonesia — satu sumber untuk semua string yang tampil di antarmuka.
 * Output AI (ide, prompt, caption) selalu Bahasa Inggris; hanya label UI yang Indonesia.
 */

export const UI = {
  // Navigasi
  nav: {
    dashboard: "Dashboard",
    kanal: "Kanal",
    ide: "Ide",
    paket: "Paket Konten",
    aset: "Kotak Masuk Aset",
    jadwal: "Jadwal",
    pengaturan: "Pengaturan",
  },

  // Dashboard
  dashboard: {
    judul: "TimeLoom — Pusat Komando",
    subjudul: "Kelola 3 kanal YouTube Shorts & TikTok",
    antreanHariIni: "Antrean Hari Ini",
    statusVideo: "Video per Hari",
    metrik7Hari: "Metrik 7 Hari",
    views: "Views",
    subsGained: "Subs/Followers +",
  },

  // Status pipeline
  status: {
    antrean_ide: "Antrean Ide",
    prompt_siap: "Prompt Siap",
    generating: "Generating",
    kotak_masuk_aset: "Kotak Masuk Aset",
    komposisi_overlay: "Komposisi Overlay",
    menunggu_review: "Menunggu Review",
    terjadwal: "Terjadwal",
    tayang: "Tayang",
    gagal: "Gagal/Retry",
  },

  // Kill switch
  killSwitch: {
    auto: "Auto Penuh",
    review: "Review Sebelum Tayang",
    jeda: "Jeda Semua",
    ikutGlobal: "Ikut Pengaturan Global",
    label: "Mode Otomasi",
  },

  // Mode Flow
  modeFlow: {
    judul: "Mode Flow — Siap Tempel ke Google Flow",
    rekapSetelan: "Rekap Setelan Target",
    engine: "Engine",
    rasio: "Rasio",
    durasi: "Durasi",
    shot: "Shot",
    salinPrompt: "Salin Prompt",
    tersalin: "Tersalin!",
    gagalSalin: "Gagal menyalin — salin manual",
    panduan: "Langkah di Google Flow:",
    langkah1: "1. Buka Google Flow (flow.google.com)",
    langkah2: "2. Set engine: Gemini Omni Flash 1.1",
    langkah3: "3. Set rasio: 9:16 (vertikal), durasi: 6–10 detik",
    langkah4: "4. Tempel prompt di kolom prompt",
    langkah5: "5. Generate video",
    langkah6: "6. Download hasil (MP4)",
    langkah7: "7. Drop file ke Kotak Masuk Aset kanal ini",
    bukaFolder: "Buka Folder Kotak Masuk",
    salinPath: "Salin Path Folder",
    alternatif: "Alternatif",
    promptUtama: "Prompt Utama",
    validasiValid: "Valid",
    validasiPeringatan: "Peringatan",
    validasiDitolak: "Ditolak",
  },

  // Aset
  aset: {
    judul: "Kotak Masuk Aset",
    subjudul: "Upload video hasil generate dari Google Flow",
    unggahVideo: "Unggah Video",
    dropFile: "Drop file video di sini atau klik untuk pilih",
    formatInfo: "Format: MP4, WebM · Maks 200 MB · 9:16 · 4–12 detik",
    daftarFile: "File di Kotak Masuk",
    pathFolder: "Path Folder (untuk drop manual):",
    status: {
      menunggu: "Menunggu Proses",
      diproses: "Sedang Diproses",
      valid: "Valid",
      ditolak: "Ditolak",
    },
  },

  // Prompt validator
  validasi: {
    elemenLengkap: "5 elemen wajib lengkap (kamera, gaya, cahaya, lokasi, aksi)",
    adaAudio: "Blok audio eksplisit (sumber suara)",
    formatVertikal: "Format 9:16 (vertikal)",
    durasiValid: "Durasi 6–10 detik",
    antiCut: "Frasa single-shot / anti-cut",
    laranganEnkoded: "Pantangan dienkode positif (bukan daftar negatif)",
    panjangKalimat: "Panjang 3–5 kalimat",
    judulLength: "Judul YouTube ≤ 100 karakter",
    ttTeksLength: "Teks TikTok ≤ 150 karakter",
    shortsWajib: "#Shorts wajib di caption YouTube",
    shortsDilarang: "#Shorts dilarang di caption TikTok",
    hashtagCount: "3–5 hashtag per platform",
  },

  // Umum
  umum: {
    simpan: "Simpan",
    batal: "Batal",
    hapus: "Hapus",
    edit: "Edit",
    generate: "Generate",
    refresh: "Refresh",
    loading: "Memuat...",
    error: "Terjadi kesalahan",
    sukses: "Berhasil",
    ya: "Ya",
    tidak: "Tidak",
    semua: "Semua",
    filter: "Filter",
  },
} as const;
