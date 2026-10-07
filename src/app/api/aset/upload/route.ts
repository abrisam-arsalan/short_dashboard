import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { terimaAset } from "@/server/lapisan/aset";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kanalSlug = formData.get("kanalSlug") as string | null;

    if (!file || !kanalSlug) {
      return Response.json({ error: "File dan kanalSlug wajib diisi" }, { status: 400 });
    }

    // Tulis ke tmp dulu, lalu proses via terimaAset
    const tmpDir = join(STORAGE_ROOT, "tmp");
    await mkdir(tmpDir, { recursive: true });

    const tmpPath = join(tmpDir, `${Date.now()}-${file.name}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(tmpPath, buffer);

    const hasil = await terimaAset(kanalSlug, tmpPath, "upload_form");
    return Response.json(hasil);
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json({ sukses: false, pesan: "Gagal upload file" }, { status: 500 });
  }
}
