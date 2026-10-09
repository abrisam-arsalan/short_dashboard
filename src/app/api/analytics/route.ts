import { NextRequest } from "next/server";
import { leaderboard, deteksiFormatSukses } from "@/server/lapisan/analytics";
import { generatePlaybook } from "@/server/lapisan/playbook";

/**
 * GET /api/analytics — Leaderboard 3 kanal + Format Sukses + Playbook (M4).
 */
export async function GET() {
  try {
    const board = await leaderboard();
    const { db } = await import("@/lib/db");
    const kanals = await db.kanal.findMany();

    const playbookData = await Promise.all(
      kanals.map(async (k) => ({
        kanal: k.nama,
        slug: k.slug,
        playbook: await generatePlaybook(k.id),
        formatSukses: await deteksiFormatSukses(k.id),
      })),
    );

    return Response.json({ leaderboard: board, playbook: playbookData });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Analytics error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

/**
 * POST /api/analytics — Trigger sync analytics (dipanggil scheduler).
 */
export async function POST(_req: NextRequest) {
  try {
    const { syncYoutubeAnalytics, syncTiktokAnalytics } = await import("@/server/lapisan/analytics");
    const yt = await syncYoutubeAnalytics();
    const tt = await syncTiktokAnalytics();
    return Response.json({ sukses: true, youtube: yt, tiktok: tt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sync error";
    return Response.json({ sukses: false, pesan: msg }, { status: 500 });
  }
}
