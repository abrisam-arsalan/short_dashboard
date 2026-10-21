import { NextRequest } from "next/server";
import { ambilStoryboard } from "@/server/lapisan/storyboard";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ ideId: string }> },
) {
  try {
    const { ideId } = await ctx.params;
    const sb = await ambilStoryboard(ideId);
    if (!sb) return Response.json({ error: "Storyboard belum dibuat untuk ide ini" }, { status: 404 });
    return Response.json({ sukses: true, storyboard: sb });
  } catch (err) {
    console.error("GET storyboard error:", err);
    return Response.json({ error: "Gagal ambil storyboard" }, { status: 500 });
  }
}
