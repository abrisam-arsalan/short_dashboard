import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { renderCutPrompt } from "@/server/lapisan/prompt";
import { validasiCutPrompt } from "@/server/lapisan/validasi";

/** Generate satu CutPrompt untuk StoryboardCut */
// POST /api/storyboard/{storyboardId}/cut/{cutId}/prompt  body: { slot?: "utama"|"alt1"|"alt2" }
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ storyboardId: string; cutId: string }> },
) {
  try {
    const { cutId } = await ctx.params;
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const slot = (body.slot === "alt1" || body.slot === "alt2") ? body.slot : "utama";

    const cut = await db.storyboardCut.findUnique({ where: { id: cutId } });
    if (!cut) return Response.json({ error: "Cut tidak ditemukan" }, { status: 404 });

    const mod = await db.pengubahPrompt.findFirst({ where: { perintah: cut.gerakanKamera } });

    const { teksPrompt, elemen } = renderCutPrompt(
      { visual: cut.visual, gerakanKamera: cut.gerakanKamera, narasiId: cut.narasiId, nadaTag: cut.nadaTag, teksOverlay: cut.teksOverlay },
      mod?.deskripsi,
    );

    const v = validasiCutPrompt(teksPrompt);

    // Dapatkan ideId dari storyboard
    const sb = await db.storyboard.findUnique({ where: { id: cut.storyboardId }, select: { ideId: true } });
    if (!sb) return Response.json({ error: "Storyboard tidak ditemukan" }, { status: 404 });

    const existing = await db.cutPrompt.findUnique({ where: { storyboardCutId: cutId } });

    const row = existing
      ? await db.cutPrompt.update({ where: { id: existing.id }, data: { slot, teksPrompt, struktur: JSON.stringify(elemen), statusValidasi: v.status, detailValidasi: JSON.stringify(v.temuan) } })
      : await db.cutPrompt.create({ data: { ideId: sb.ideId, storyboardCutId: cutId, slot, teksPrompt, struktur: JSON.stringify(elemen), statusValidasi: v.status, detailValidasi: JSON.stringify(v.temuan) } });

    return Response.json({ sukses: true, cutPrompt: row, validasi: v });
  } catch (err) {
    console.error("CutPrompt error:", err);
    const message = err instanceof Error ? err.message : "Gagal generate prompt untuk cut";
    return Response.json({ error: message }, { status: 500 });
  }
}
