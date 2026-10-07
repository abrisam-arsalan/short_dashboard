import { NextRequest } from "next/server";
import { uploadTiktokInbox, tandaiSudahTayang } from "@/server/lapisan/tiktok";

/**
 * POST /api/publish/tiktok/[paketId] — Upload ke TikTok Inbox.
 * Body: { aksi: "upload" | "tandai_tayang" }
 */
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ paketId: string }> },
) {
  try {
    const { paketId } = await ctx.params;
    const body = await req.json().catch(() => ({ aksi: "upload" }));
    const aksi = body.aksi ?? "upload";

    if (aksi === "tandai_tayang") {
      await tandaiSudahTayang(paketId);
      return Response.json({ sukses: true, pesan: "Ditandai sudah tayang" });
    }

    const hasil = await uploadTiktokInbox(paketId);
    return Response.json(hasil, { status: hasil.sukses ? 200 : 500 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload TikTok gagal";
    return Response.json({ sukses: false, pesan: msg }, { status: 500 });
  }
}
