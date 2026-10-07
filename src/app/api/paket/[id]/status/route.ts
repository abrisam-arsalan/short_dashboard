import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { URUTAN_STATUS, type StatusPipeline } from "@/server/domain/status";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { status: statusBaru } = body;

    const paket = await db.paketKonten.findUnique({ where: { id } });
    if (!paket) {
      return Response.json({ error: "Paket tidak ditemukan" }, { status: 404 });
    }

    const statusSaatIni = paket.status as StatusPipeline;
    const diizinkan = URUTAN_STATUS[statusSaatIni] ?? [];

    if (!diizinkan.includes(statusBaru as StatusPipeline)) {
      return Response.json(
        { error: `Transisi ${statusSaatIni} → ${statusBaru} tidak diizinkan` },
        { status: 400 },
      );
    }

    const update = await db.paketKonten.update({
      where: { id },
      data: {
        status: statusBaru,
        ...(statusBaru === "tayang" ? { tayangPada: new Date() } : {}),
      },
    });

    return Response.json({ sukses: true, paket: update });
  } catch (err) {
    console.error("Update status error:", err);
    return Response.json({ error: "Gagal update status" }, { status: 500 });
  }
}
