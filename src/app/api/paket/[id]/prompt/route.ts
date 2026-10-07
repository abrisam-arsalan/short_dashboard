import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const paket = await db.paketKonten.findUnique({
    where: { id },
    include: {
      ide: true,
      promptPaket: true,
      caption: true,
      kanal: { include: { profil: true } },
    },
  });

  if (!paket) {
    return Response.json({ error: "Paket tidak ditemukan" }, { status: 404 });
  }

  return Response.json(paket);
}
