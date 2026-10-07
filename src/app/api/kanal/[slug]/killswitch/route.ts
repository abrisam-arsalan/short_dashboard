import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { updateKillSwitch } from "@/server/lapisan/killswitch";
import type { ModeKillSwitch } from "@/server/domain/status";

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const body = await req.json();
    const { mode } = body;

    const kanal = await db.kanal.findUnique({ where: { slug } });
    if (!kanal) {
      return Response.json({ error: "Kanal tidak ditemukan" }, { status: 404 });
    }

    await updateKillSwitch(kanal.id, mode as ModeKillSwitch);
    return Response.json({ sukses: true });
  } catch (err) {
    console.error("Kill switch error:", err);
    return Response.json({ error: "Gagal update kill switch" }, { status: 500 });
  }
}
