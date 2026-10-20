import { NextRequest } from "next/server";
import { generateStoryboard } from "@/server/lapisan/storyboard";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ideId, durasiTotal, preset } = body;
    if (!ideId) return Response.json({ error: "ideId wajib diisi" }, { status: 400 });
    if (durasiTotal !== 10 && durasiTotal !== 20)
      return Response.json({ error: "durasiTotal harus 10 atau 20" }, { status: 400 });
    if (preset !== "short" && preset !== "detail")
      return Response.json({ error: "preset harus 'short' (5 cut) atau 'detail' (8 cut)" }, { status: 400 });
    if (durasiTotal === 10 && preset !== "short")
      return Response.json({ error: "10s hanya ubah 'short'" }, { status: 400 });
    if (durasiTotal === 20 && preset !== "detail")
      return Response.json({ error: "20s hanya untuk 'detail'" }, { status: 400 });

    const storyboard = await generateStoryboard(ideId, { durasiTotal, preset });
    return Response.json({
      sukses: true,
      storyboard,
      durasiTotal,
      jumlahCut: (storyboard as { cuts: unknown[] }).cuts?.length ?? null,
    });
  } catch (err) {
    console.error("Generate storyboard error:", err);
    const message = err instanceof Error ? err.message : "Gagal generate storyboard";
    return Response.json({ error: message }, { status: 500 });
  }
}
