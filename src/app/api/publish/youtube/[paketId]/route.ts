import { NextRequest } from "next/server";
import { uploadYoutube } from "@/server/lapisan/youtube";

/**
 * POST /api/publish/youtube/[paketId] — Upload video ke YouTube Shorts.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ paketId: string }> },
) {
  try {
    const { paketId } = await ctx.params;
    const hasil = await uploadYoutube(paketId);
    return Response.json(hasil, { status: hasil.sukses ? 200 : 500 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload gagal";
    return Response.json({ sukses: false, pesan: msg }, { status: 500 });
  }
}
