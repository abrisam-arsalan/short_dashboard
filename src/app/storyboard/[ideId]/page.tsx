import { connection } from "next/server";
import { db } from "@/lib/db";

export const instant = false;
import { UI } from "@/lib/teks";
import { StoryboardBoard } from "@/components/StoryboardBoard";
import { StoryboardGeneratePanel } from "./StoryboardGeneratePanel";

export default async function StoryboardPage(ctx: { params: Promise<{ ideId: string }> }) {
  await connection();
  const { ideId } = await ctx.params;

  const ide = await db.ide.findUnique({
    where: { id: ideId },
    include: { kanal: true },
  });

  if (!ide) {
    return (
      <div className="p-8 text-center text-gray-400">
        Ide tidak ditemukan. <a href="/ide" className="text-blue-400 underline">Kembali ke Ide</a>
      </div>
    );
  }

  const storyboard = await db.storyboard.findUnique({
    where: { ideId },
    include: { cuts: { orderBy: { urutan: "asc" } } },
  });

  // Serialize for client component (Decimal etc not present)
  const sbJson = storyboard
    ? {
        id: storyboard.id,
        ideId: storyboard.ideId,
        durasiTotal: storyboard.durasiTotal,
        presetCut: storyboard.presetCut,
        status: storyboard.status,
        detailValidasi: storyboard.detailValidasi,
        cuts: storyboard.cuts.map((c) => ({
          id: c.id,
          storyboardId: c.storyboardId,
          urutan: c.urutan,
          labelCut: c.labelCut,
          detikAwal: c.detikAwal,
          detikAkhir: c.detikAkhir,
          visual: c.visual,
          gerakanKamera: c.gerakanKamera,
          teksOverlay: c.teksOverlay,
          narasiId: c.narasiId,
          nadaTag: c.nadaTag,
          fungsiCatatan: c.fungsiCatatan,
        })),
      }
    : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div>
        <a href="/ide" className="text-sm text-gray-500 hover:text-gray-300">← Kembali ke Ide</a>
        <h1 className="text-2xl font-bold text-white mt-2">{UI.storyboard.judul}</h1>
        <p className="text-gray-400 text-sm">
          Ide: <span className="text-gray-200">{ide.judulEn}</span> · Kanal: {ide.kanal.nama}
        </p>
        <p className="text-xs text-gray-500 mt-1">{ide.transformasi}</p>
      </div>

      <StoryboardGeneratePanel ideId={ideId} storyboard={sbJson} />

      {sbJson ? (
        <StoryboardBoard storyboard={sbJson} />
      ) : (
        <div className="bg-gray-900 rounded-xl border border-dashed border-gray-700 p-8 text-center">
          <p className="text-gray-400">{UI.storyboard.belumPunyaStoryboard}</p>
          <p className="text-sm text-gray-500 mt-1">{UI.storyboard.belumDipilih}</p>
        </div>
      )}
    </div>
  );
}
