import { NextRequest } from "next/server";
import { generateIde } from "@/server/lapisan/ide";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kanalId, instruksiVariasi } = body;

    if (!kanalId) {
      return Response.json({ error: "kanalId wajib diisi" }, { status: 400 });
    }

    const ide = await generateIde(kanalId, instruksiVariasi);
    return Response.json({ sukses: true, jumlah: ide.length, ide });
  } catch (err) {
    console.error("Generate ide error:", err);
    return Response.json({ error: "Gagal generate ide" }, { status: 500 });
  }
}
