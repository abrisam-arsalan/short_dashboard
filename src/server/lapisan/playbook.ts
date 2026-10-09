/**
 * Playbook Niche — ringkasan pola menang/kalah per kanal (FR-27).
 *
 * ⚠️ Playbook Niche efektif mulai hari ke-4/5 setelah data performa terkumpul (48-72h lag).
 * Cold start: hari 1-3 kosong — idea generator hanya pakai Profil Niche.
 *
 * Data masukan: metrik per video (analytics) → pola (transformasi, hook, durasi) → ringkasan.
 * Data keluaran: string konteks yang di-inject ke prompt generator ide.
 */
import { db } from "@/lib/db";

interface PolaMenang {
  kunci: string; // mis. "refinishing furniture"
  jumlah: number;
  rataViews: number;
  contohJudul: string[];
}

interface Playbook {
  kanalId: string;
  polaMenang: PolaMenang[];
  polaKalah: PolaMenang[];
  totalVideo: number;
  rataViewsKanal: number;
  rekomendasi: string[]; // kalimat EN yang di-inject ke prompt generator ide
}

/**
 * Generate Playbook Niche untuk satu kanal.
 * Analisis semua video tayang → kelompokkan berdasarkan kata kunci transformasi → hitung performa.
 */
export async function generatePlaybook(kanalId: string): Promise<Playbook> {
  const kanal = await db.kanal.findUniqueOrThrow({
    where: { id: kanalId },
    include: {
      profil: true,
      paket: {
        where: { status: "tayang" },
        select: { catatanProduksi: true, ide: true, tayangPada: true },
        orderBy: { tayangPada: "desc" },
        take: 100,
      },
    },
  });

  if (kanal.paket.length === 0) {
    return {
      kanalId,
      polaMenang: [],
      polaKalah: [],
      totalVideo: 0,
      rataViewsKanal: 0,
      rekomendasi: ["// Playbook Niche: belum ada data performa (cold start)"],
    };
  }

  // Extract data per video
  const videos = kanal.paket
    .map((p) => {
      try {
        const catatan = JSON.parse(p.catatanProduksi ?? "{}");
        const analytics = catatan.analytics ?? {};
        return {
          judul: p.ide?.judulEn ?? "",
          transformasi: p.ide?.transformasi ?? "",
          hookVisual: p.ide?.hookVisual ?? "",
          views: analytics.views ?? 0,
          likes: analytics.likes ?? 0,
          retentionPct: analytics.retentionPct ?? 0,
          tayangPada: p.tayangPada,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (videos.length === 0) {
    return {
      kanalId,
      polaMenang: [],
      polaKalah: [],
      totalVideo: 0,
      rataViewsKanal: 0,
      rekomendasi: ["// Playbook Niche: belum ada data analytics"],
    };
  }

  // Hitung rata-rata views
  const totalViews = videos.reduce((sum, v) => sum + (v?.views ?? 0), 0);
  const rataViewsKanal = totalViews / videos.length;

  // Kelompokkan berdasarkan kata kunci transformasi (simple: kata kunci dari transformasi)
  const kelompok = new Map<string, { views: number[]; judul: string[] }>();

  for (const v of videos) {
    if (!v) continue;
    // Extract kata kunci dari transformasi (2-3 kata pertama yang bermakna)
    const kataKunci = extractKunciTransformasi(v.transformasi);
    const entry = kelompok.get(kunci) ?? { views: [], judul: [] };
    entry.views.push(v.views);
    entry.judul.push(v.judul);
    kelompok.set(kunci, entry);
  }

  // Hitung performa per kelompok
  const semuaPola: PolaMenang[] = [];
  for (const [kunci, entry] of kelompok) {
    const rata = entry.views.reduce((s, v) => s + v, 0) / entry.views.length;
    semuaPola.push({
      kunci,
      jumlah: entry.views.length,
      rataViews: Math.round(rata),
      contohJudul: entry.judul.slice(0, 3),
    });
  }

  // Sort: best & worst
  semuaPola.sort((a, b) => b.rataViews - a.rataViews);
  const polaMenang = semuaPola.slice(0, 3);
  const polaKalah = semuaPola.slice(-2).reverse();

  // Generate rekomendasi (Bahasa Inggris untuk inject ke prompt)
  const rekomendasi: string[] = [];

  if (polaMenang.length > 0 && polaMenang[0].rataViews > rataViewsKanal) {
    rekomendasi.push(
      `TOP PERFORMER: "${polaMenang[0].kunci}" content gets ${polaMenang[0].rataViews} avg views (${(polaMenang[0].rataViews / rataViewsKanal).toFixed(1)}x average). Prioritize this transformation type.`,
    );
  }

  if (polaMenang.length > 1) {
    rekomendasi.push(
      `ALSO EFFECTIVE: "${polaMenang[1].kunci}" (${polaMenang[1].rataViews} avg views).`,
    );
  }

  if (polaKalah.length > 0 && polaKalah[0].rataViews < rataViewsKanal * 0.5) {
    rekomendasi.push(
      `UNDERPERFORMING: "${polaKalah[0].kunci}" gets only ${polaKalah[0].rataViews} avg views. Avoid this transformation type or try new angle.`,
    );
  }

  if (rekomendasi.length === 0) {
    rekomendasi.push(
      `// Playbook Niche: ${videos.length} video analyzed, avg ${Math.round(rataViewsKanal)} views. No clear pattern yet.`,
    );
  }

  return {
    kanalId,
    polaMenang,
    polaKalah,
    totalVideo: videos.length,
    rataViewsKanal: Math.round(rataViewsKanal),
    rekomendasi,
  };
}

/**
 * Render Playbook → string untuk inject ke prompt generator ide (FR-27).
 */
export function renderPlaybookUntukPrompt(playbook: Playbook): string {
  if (playbook.totalVideo === 0) {
    return "// Playbook Niche: belum ada data performa (cold start hari 1-3)";
  }

  const lines = [
    `// Playbook Niche (berdasarkan ${playbook.totalVideo} video, avg ${playbook.rataViewsKanal} views)`,
    ...playbook.rekomendasi.map((r) => `// ${r}`),
  ];

  return lines.join("\n");
}

/**
 * Extract kata kunci transformasi → "kunci" untuk kelompokkan.
 */
function extractKunciTransformasi(transformasi: string): string {
  // Ambil kata benda utama dari transformasi
  // Simplified: ambil 2-3 kata pertama yang bukan stop words
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "can", "into", "from", "to", "and", "or",
    "but", "not", "no", "of", "in", "on", "at", "by", "for", "with",
  ]);

  const kata = transformasi
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 3);

  return kata.join(" ") || transformasi.slice(0, 30).toLowerCase();
}
