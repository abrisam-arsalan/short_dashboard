import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { dismissIde, generatePromptPack } from "@/server/lapisan/ide";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { aksi, alasan } = body;

    if (aksi === "dismiss") {
      await dismissIde(id, alasan || "");
      return Response.json({ sukses: true });
    }

    if (aksi === "generate_prompt") {
      const promptPaket = await generatePromptPack(id);
      return Response.json({ sukses: true, promptPaket });
    }

    return Response.json({ error: "Aksi tidak dikenal" }, { status: 400 });
  } catch (err) {
    console.error("Ide action error:", err);
    return Response.json({ error: "Gagal memproses aksi" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const ide = await db.ide.findUnique({
    where: { id },
    include: {
      promptPack: true,
      paket: { include: { caption: true } },
    },
  });

  if (!ide) {
    return Response.json({ error: "Ide tidak ditemukan" }, { status: 404 });
  }

  return Response.json(ide);
}
