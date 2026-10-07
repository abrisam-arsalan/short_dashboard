import { daftarDraftMenunggu } from "@/server/lapisan/tiktok";

/**
 * GET /api/publish/tiktok — Daftar draft TikTok yang menunggu publish (FR-20a).
 */
export async function GET() {
  const daftar = await daftarDraftMenunggu();
  return Response.json({ daftar });
}
