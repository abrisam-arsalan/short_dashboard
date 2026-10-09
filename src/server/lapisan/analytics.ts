/**
 * Analytics — YouTube Analytics API + TikTok Analytics (M4, FR-24).
 *
 * ⚠️ YouTube Analytics API lag 48-72 jam setelah upload (PRD v1.4 disclaimer).
 * ⚠️ TikTok Analytics lag serupa.
 *
 * Data yang diambil:
 *   - YouTube: views, likes, comments, shares, average % viewed (retention), subscribers gained
 *   - TikTok: views, likes, comments, shares, followers gained
 *
 * Dipakai untuk: Leaderboard (FR-25), Format Sukses (FR-26), Playbook Niche (FR-27).
 */
import { db } from "@/lib/db";
import { ambilKredensial } from "@/server/vault";
import { google } from "googleapis";

interface MetrikVideo {
  paketId: string;
  platform: "youtube" | "tiktok";
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  retentionPct?: number; // average % viewed (YouTube)
  followersGained: number;
  diambilPada: Date;
}

/**
 * Sinkronisasi metrik YouTube untuk semua video yang sudah tayang.
 * Fokus: video yang tayang 24-72 jam lalu (lag window).
 */
export async function syncYoutubeAnalytics(): Promise<{ diupdate: number; pesan: string }> {
  const kanals = await db.kanal.findMany();

  let diupdate = 0;

  for (const kanal of kanals) {
    const accessToken = await ambilKredensial(kanal.id, "youtube_oauth", "access_token");
    if (!accessToken) continue;

    try {
      const clientId = await ambilKredensial(kanal.id, "youtube_oauth", "client_id");
      const clientSecret = await ambilKredensial(kanal.id, "youtube_oauth", "client_secret");
      const refreshToken = await ambilKredensial(kanal.id, "youtube_oauth", "refresh_token");

      const oauth2Client = new google.auth.OAuth2(clientId ?? "", clientSecret ?? "");
      oauth2Client.setCredentials({ access_token: accessToken, refresh_token: refreshToken });

      // Ambil video yang tayang 24-72 jam lalu (lag window)
      const batasBawah = new Date(Date.now() - 72 * 3600000); // 72 jam lalu
      const batasAtas = new Date(Date.now() - 24 * 3600000); // 24 jam lalu

      const paketTayang = await db.paketKonten.findMany({
        where: {
          kanalId: kanal.id,
          status: "tayang",
          tayangPada: { gte: batasBawah, lte: batasAtas },
        },
      });

      for (const paket of paketTayang) {
        const catatan = paket.catatanProduksi ? JSON.parse(paket.catatanProduksi) : {};
        const videoId = catatan.youtube_video_id;
        if (!videoId) continue;

        // YouTube Analytics API — ambil metrik
        const youtube = google.youtube("v3");
        const res = await youtube.videos.list({
          auth: oauth2Client,
          part: ["statistics"],
          id: [videoId],
        });

        const video = res.data.items?.[0];
        if (video?.statistics) {
          await db.paketKonten.update({
            where: { id: paket.id },
            data: {
              catatanProduksi: JSON.stringify({
                ...catatan,
                analytics: {
                  platform: "youtube",
                  views: parseInt(video.statistics.viewCount ?? "0"),
                  likes: parseInt(video.statistics.likeCount ?? "0"),
                  comments: parseInt(video.statistics.commentCount ?? "0"),
                  shares: 0, // YouTube analytics API tidak expose shares di statistics
                  diambilPada: new Date().toISOString(),
                },
              }),
            },
          });
          diupdate++;
        }
      }
    } catch (err) {
      console.error(`Analytics YouTube error (${kanal.slug}):`, err);
    }
  }

  return {
    diupdate,
    pesan: `${diupdate} video YouTube diperbarui (lag 48-72 jam)`,
  };
}

/**
 * Sinkronisasi metrik TikTok.
 * Catatan: TikTok Analytics API butuh approval. Sementara: catat dari catatanProduksi.
 */
export async function syncTiktokAnalytics(): Promise<{ diupdate: number; pesan: string }> {
  // TikTok Analytics API terbatas — data manual dari operator (tap publish)
  // M4: aggregate dari catatanProduksi yang sudah ada

  const paketTayang = await db.paketKonten.findMany({
    where: {
      status: "tayang",
      catatanProduksi: { contains: "tiktok_status" },
    },
    take: 50,
    orderBy: { tayangPada: "desc" },
  });

  return {
    diupdate: 0,
    pesan: `TikTok analytics: ${paketTayang.length} video dilacak. Data manual dari operator.`,
  };
}

/**
 * Leaderboard 3 kanal — aggregate metrik (FR-25).
 */
export async function leaderboard() {
  const kanals = await db.kanal.findMany({
    include: {
      paket: {
        where: { status: "tayang" },
        select: { catatanProduksi: true, tayangPada: true },
      },
    },
  });

  return kanals.map((kanal) => {
    let totalViews = 0;
    let totalLikes = 0;
    let videoCount = kanal.paket.length;

    for (const paket of kanal.paket) {
      try {
        const catatan = JSON.parse(paket.catatanProduksi ?? "{}");
        const analytics = catatan.analytics ?? {};
        totalViews += analytics.views ?? 0;
        totalLikes += analytics.likes ?? 0;
      } catch {}
    }

    return {
      slug: kanal.slug,
      nama: kanal.nama,
      videoTayang: videoCount,
      totalViews,
      totalLikes,
      rataViews: videoCount > 0 ? Math.round(totalViews / videoCount) : 0,
    };
  });
}

/**
 * Tandai "Format Sukses" (FR-26) — pola video yang performanya tinggi.
 * Auto-detect: video dengan views > 2× rata-rata kanal.
 */
export async function deteksiFormatSukses(kanalId: string) {
  const kanal = await db.kanal.findUniqueOrThrow({
    where: { id: kanalId },
    include: {
      paket: {
        where: { status: "tayang" },
        select: { catatanProduksi: true, ide: true },
      },
    },
  });

  // Hitung rata-rata views
  let totalViews = 0;
  let count = 0;
  const videos = kanal.paket
    .map((p) => {
      try {
        const catatan = JSON.parse(p.catatanProduksi ?? "{}");
        const views = catatan.analytics?.views ?? 0;
        totalViews += views;
        count++;
        return { id: p.ide?.id, judul: p.ide?.judulEn, views, transformasi: p.ide?.transformasi };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (count === 0) return [];

  const rataViews = totalViews / count;
  const sukses = videos.filter((v) => v && v.views > rataViews * 2);

  return sukses.map((v) => ({
    ...v,
    skorViews: v ? (v.views / rataViews).toFixed(1) : "0",
  }));
}
