import { NextRequest } from "next/server";
import { generateCaption } from "@/server/lapisan/caption";

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const hasil = await generateCaption(id);
    return Response.json({ sukses: true, ...hasil });
  } catch (err) {
    console.error("Generate caption error:", err);
    return Response.json({ error: "Gagal generate caption" }, { status: 500 });
  }
}
